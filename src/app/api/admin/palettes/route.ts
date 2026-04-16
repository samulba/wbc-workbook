import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── GET /api/admin/palettes ───────────────────────────────────────────────────
// Query params: search, room_effect, status (active|inactive|all), page, limit

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search     = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const roomEffect = searchParams.get("room_effect") ?? "";
  const status     = searchParams.get("status") ?? "all";
  const page       = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit      = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 24)));

  const admin = createAdminClient();

  // Fetch all for stats + filtering
  const { data: all, error } = await admin
    .from("color_palettes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = all ?? [];

  // Stats
  const stats = {
    total:    rows.length,
    active:   rows.filter((r) => r.is_active).length,
    inactive: rows.filter((r) => !r.is_active).length,
    effects:  [...new Set(rows.map((r) => r.room_effect).filter(Boolean))].length,
  };

  // Filter
  let filtered = rows;
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.name?.toLowerCase().includes(search) ||
        r.room_effect?.toLowerCase().includes(search)
    );
  }
  if (roomEffect) {
    filtered = filtered.filter((r) => r.room_effect === roomEffect);
  }
  if (status === "active")   filtered = filtered.filter((r) => r.is_active);
  if (status === "inactive") filtered = filtered.filter((r) => !r.is_active);

  const total  = filtered.length;
  const offset = (page - 1) * limit;
  const items  = filtered.slice(offset, offset + limit);

  // Distinct room effects for filter dropdown
  const roomEffects = [...new Set(rows.map((r) => r.room_effect).filter(Boolean))].sort();

  return NextResponse.json({ items, total, stats, roomEffects });
}

// ── POST /api/admin/palettes ──────────────────────────────────────────────────
// Body: { name, room_effect?, primary_colors[], secondary_colors[], accent_color?, is_active? }

export async function POST(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, room_effect, primary_colors, secondary_colors, accent_color, is_active } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("color_palettes")
    .insert({
      name:             name.trim(),
      room_effect:      room_effect?.trim() || null,
      primary_colors:   Array.isArray(primary_colors)   ? primary_colors   : [],
      secondary_colors: Array.isArray(secondary_colors) ? secondary_colors : [],
      accent_color:     accent_color?.trim() || null,
      is_active:        is_active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
