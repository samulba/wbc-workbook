import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/feedback ───────────────────────────────────────────────────
// Query params: type, status, search, page, limit

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp     = new URL(req.url).searchParams;
  const type   = sp.get("type")   ?? "";
  const status = sp.get("status") ?? "";
  const search = sp.get("search")?.trim().toLowerCase() ?? "";
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(sp.get("limit") ?? "25"));

  const admin = createAdminClient();

  // Fetch all feedback (no pagination in DB — do it in JS for stats)
  const { data: all, error } = await admin
    .from("user_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = all ?? [];

  // Stats on full set
  const stats = {
    total:    rows.length,
    neu:      rows.filter((r) => r.status === "neu").length,
    gelesen:  rows.filter((r) => r.status === "gelesen").length,
    erledigt: rows.filter((r) => r.status === "erledigt").length,
  };

  // Filter
  let filtered = rows;
  if (type)   filtered = filtered.filter((r) => r.type === type);
  if (status) filtered = filtered.filter((r) => r.status === status);
  if (search) filtered = filtered.filter((r) =>
    r.message?.toLowerCase().includes(search) ||
    r.page_url?.toLowerCase().includes(search)
  );

  // Fetch user info (email + name) for each unique user_id
  const userIds = Array.from(new Set(filtered.map((r) => r.user_id).filter(Boolean)));
  const profileMap = new Map<string, { full_name: string | null }>();
  const emailMap   = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds as string[]);
    for (const p of profiles ?? []) profileMap.set(p.id, { full_name: p.full_name });

    // Fetch emails from auth (one call per unique user is inefficient; batch differently)
    // We use listUsers and filter — for small sets this is fine
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authData?.users ?? []) {
      if (userIds.includes(u.id)) emailMap.set(u.id, u.email ?? "");
    }
  }

  // Enrich filtered rows
  const enriched = filtered.map((r) => ({
    ...r,
    user_name:  r.user_id ? (profileMap.get(r.user_id)?.full_name ?? null) : null,
    user_email: r.user_id ? (emailMap.get(r.user_id) ?? null)             : null,
  }));

  // Paginate
  const total  = enriched.length;
  const offset = (page - 1) * limit;
  const items  = enriched.slice(offset, offset + limit);

  return NextResponse.json({ items, total, stats });
}
