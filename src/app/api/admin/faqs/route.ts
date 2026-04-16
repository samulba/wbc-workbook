import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── GET /api/admin/faqs ───────────────────────────────────────────────────────
// Query params: search, category, status (active|inactive|all)

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";
  const status   = searchParams.get("status") ?? "all";

  const admin = createAdminClient();
  const { data: all, error } = await admin
    .from("faqs")
    .select("*")
    .order("category")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = all ?? [];

  const stats = {
    total:    rows.length,
    active:   rows.filter((r) => r.is_active).length,
    inactive: rows.filter((r) => !r.is_active).length,
    categories: Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).length,
  };

  let filtered = rows;
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.question?.toLowerCase().includes(search) ||
        r.answer?.toLowerCase().includes(search)
    );
  }
  if (category) filtered = filtered.filter((r) => r.category === category);
  if (status === "active")   filtered = filtered.filter((r) => r.is_active);
  if (status === "inactive") filtered = filtered.filter((r) => !r.is_active);

  return NextResponse.json({ items: filtered, stats });
}

// ── POST /api/admin/faqs ──────────────────────────────────────────────────────
// Body: { question, answer, category, sort_order?, is_active? }

export async function POST(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { question, answer, category, sort_order, is_active } = body;

  if (!question?.trim()) return NextResponse.json({ error: "Frage ist erforderlich" }, { status: 400 });
  if (!answer?.trim())   return NextResponse.json({ error: "Antwort ist erforderlich" }, { status: 400 });
  if (!category?.trim()) return NextResponse.json({ error: "Kategorie ist erforderlich" }, { status: 400 });

  const admin = createAdminClient();

  // Compute next sort_order in category if not provided
  let order = typeof sort_order === "number" ? sort_order : 0;
  if (typeof sort_order !== "number") {
    const { data: last } = await admin
      .from("faqs")
      .select("sort_order")
      .eq("category", category.trim())
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    order = last ? (last.sort_order as number) + 1 : 0;
  }

  const { data, error } = await admin
    .from("faqs")
    .insert({
      question:   question.trim(),
      answer:     answer.trim(),
      category:   category.trim(),
      sort_order: order,
      is_active:  is_active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
