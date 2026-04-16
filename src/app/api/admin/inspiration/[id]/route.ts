import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── PATCH /api/admin/inspiration/[id] ────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Strip read-only / relational fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, user_id: _uid, ...updates } = body;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("inspiration_images")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// ── DELETE /api/admin/inspiration/[id] ────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin      = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Fetch image to check if it lives in Supabase Storage
  const { data: img } = await admin
    .from("inspiration_images")
    .select("image_url")
    .eq("id", params.id)
    .single();

  // Attempt to clean up storage if image was uploaded there
  if (img?.image_url) {
    const storageBase = `${supabaseUrl}/storage/v1/object/public/moodboards/`;
    if ((img.image_url as string).startsWith(storageBase)) {
      const storagePath = (img.image_url as string).slice(storageBase.length);
      await admin.storage.from("moodboards").remove([storagePath]);
    }
  }

  const { error } = await admin
    .from("inspiration_images")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
