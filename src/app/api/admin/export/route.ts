import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/export ─────────────────────────────────────────────────────
// Exports a JSON snapshot of key tables (no sensitive auth data)

export async function GET() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: projects },
    { data: rooms },
    { data: module1 },
    { data: products },
    { data: faqs },
    { data: palettes },
    { data: inspiration },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, role, is_active, created_at"),
    admin.from("projects").select("id, user_id, name, status, created_at"),
    admin.from("rooms").select("id, project_id, name, room_type, main_effect, created_at"),
    admin.from("module1_analysis").select("id, project_id, room_type, materials, primary_colors, created_at"),
    admin.from("products").select("id, name, category, price, is_active, created_at"),
    admin.from("faqs").select("id, question, answer, category, sort_order, is_active, created_at"),
    admin.from("color_palettes").select("id, name, room_effect, primary_colors, secondary_colors, accent_color, is_active, created_at"),
    admin.from("inspiration_images").select("id, title, image_url, room_effect, room_type, tags, is_active, created_at"),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    version:     "1.0",
    tables: {
      profiles:          profiles    ?? [],
      projects:          projects    ?? [],
      rooms:             rooms       ?? [],
      module1_analysis:  module1     ?? [],
      products:          products    ?? [],
      faqs:              faqs        ?? [],
      color_palettes:    palettes    ?? [],
      inspiration_images: inspiration ?? [],
    },
    counts: {
      profiles:          profiles?.length    ?? 0,
      projects:          projects?.length    ?? 0,
      rooms:             rooms?.length       ?? 0,
      module1_analysis:  module1?.length     ?? 0,
      products:          products?.length    ?? 0,
      faqs:              faqs?.length        ?? 0,
      color_palettes:    palettes?.length    ?? 0,
      inspiration_images: inspiration?.length ?? 0,
    },
  };

  const json     = JSON.stringify(exportData, null, 2);
  const filename = `wbc-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(json, {
    headers: {
      "Content-Type":        "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
