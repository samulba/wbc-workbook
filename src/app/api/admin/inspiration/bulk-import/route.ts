import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── POST /api/admin/inspiration/bulk-import ───────────────────────────────────
// Body: { rows: Array<{ image_url, title?, description?, room_effect?, room_type?, colors?: string[], tags?: string[] }> }

export async function POST(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await req.json().catch(() => ({ rows: [] }));
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Keine Zeilen vorhanden" }, { status: 400 });
  }
  if (rows.length > 200) {
    return NextResponse.json({ error: "Maximal 200 Zeilen pro Import" }, { status: 400 });
  }

  // Validate + sanitize rows
  const valid = rows.filter((r: Record<string, unknown>) => typeof r.image_url === "string" && r.image_url.trim());
  if (!valid.length) {
    return NextResponse.json({ error: "Keine gültigen Zeilen (image_url fehlt)" }, { status: 400 });
  }

  const insert = valid.map((r: Record<string, unknown>) => ({
    image_url:   (r.image_url as string).trim(),
    title:       r.title       ? String(r.title).trim()       : null,
    description: r.description ? String(r.description).trim() : null,
    room_effect: r.room_effect ? String(r.room_effect).trim() : null,
    room_type:   r.room_type   ? String(r.room_type).trim()   : null,
    colors:      Array.isArray(r.colors) ? r.colors : [],
    tags:        Array.isArray(r.tags)   ? r.tags   : [],
    is_active:   r.is_active !== false,
  }));

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("inspiration_images")
    .insert(insert)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data?.length ?? 0 });
}
