import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/inspiration ────────────────────────────────────────────────
// ?search=&effect=&room_type=&status=all|active|inactive&page=1&limit=24

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp       = new URL(req.url).searchParams;
  const search   = sp.get("search")    ?? "";
  const effect   = sp.get("effect")    ?? "";
  const roomType = sp.get("room_type") ?? "";
  const status   = sp.get("status")    ?? "all";
  const page     = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit    = Math.min(96,  parseInt(sp.get("limit") ?? "24"));

  const admin = createAdminClient();

  // Stats — separate count() queries so a missing optional column (is_active
  // / user_id) can't nuke the whole total. count() with head:true never
  // touches data, just returns row counts.
  const [
    { count: totalCount },
    { count: activeCount },
    { count: inactiveCount },
    { count: userUploadCount },
  ] = await Promise.all([
    admin.from("inspiration_images").select("*", { count: "exact", head: true }),
    admin.from("inspiration_images").select("*", { count: "exact", head: true })
      .or("is_active.eq.true,is_active.is.null"),
    admin.from("inspiration_images").select("*", { count: "exact", head: true })
      .eq("is_active", false),
    admin.from("inspiration_images").select("*", { count: "exact", head: true })
      .not("user_id", "is", null),
  ]);

  const stats = {
    total:        totalCount      ?? 0,
    active:       activeCount     ?? 0,
    inactive:     inactiveCount   ?? 0,
    user_uploads: userUploadCount ?? 0,
  };

  // Filtered query (DB-level filters first)
  let q = admin
    .from("inspiration_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (status === "active")   q = q.eq("is_active", true);
  if (status === "inactive") q = q.eq("is_active", false);
  if (effect)   q = q.eq("room_effect", effect);
  if (roomType) q = q.eq("room_type",   roomType);

  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Client-side search (title + tags)
  let images = rows ?? [];
  if (search) {
    const s = search.toLowerCase();
    images = images.filter(img =>
      img.title?.toLowerCase().includes(s) ||
      (img.tags as string[]).some(t => t.toLowerCase().includes(s))
    );
  }

  const total     = images.length;
  const paginated = images.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ images: paginated, total, stats });
}

// ── POST /api/admin/inspiration ───────────────────────────────────────────────
// Accepts JSON (image_url provided) or FormData (file upload)

export async function POST(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const ct = req.headers.get("content-type") ?? "";

  let imageUrl: string;
  let fields: Record<string, unknown>;

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Datei zu groß (max 10 MB)" }, { status: 400 });

    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `inspiration-uploads/admin/${Date.now()}.${ext}`;
    const buf  = await file.arrayBuffer();

    const { error: uploadErr } = await admin.storage
      .from("moodboards")
      .upload(path, buf, { contentType: file.type, upsert: false });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

    const { data: { publicUrl } } = admin.storage.from("moodboards").getPublicUrl(path);
    imageUrl = publicUrl;

    fields = {
      title:       form.get("title")       || null,
      description: form.get("description") || null,
      room_effect: form.get("room_effect") || null,
      room_type:   form.get("room_type")   || null,
      colors:      JSON.parse((form.get("colors") as string) || "[]"),
      tags:        JSON.parse((form.get("tags")   as string) || "[]"),
      is_active:   form.get("is_active") !== "false",
    };
  } else {
    const body = await req.json();
    imageUrl = body.image_url;
    if (!imageUrl) return NextResponse.json({ error: "image_url fehlt" }, { status: 400 });
    fields = body;
  }

  const { data, error } = await admin
    .from("inspiration_images")
    .insert({ ...fields, image_url: imageUrl })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
