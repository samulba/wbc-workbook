import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/error-logs ─────────────────────────────────────────────────
// Query params: period (today|7d|30d|all), type, page, limit

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp     = new URL(req.url).searchParams;
  const period = sp.get("period") ?? "7d";
  const type   = sp.get("type")   ?? "";
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(sp.get("limit") ?? "25"));

  const admin = createAdminClient();

  let query = admin.from("error_logs").select("*").order("created_at", { ascending: false });

  // Period filter
  if (period !== "all") {
    const days = period === "today" ? 1 : period === "7d" ? 7 : 30;
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    query = query.gte("created_at", since);
  }
  if (type) query = query.eq("error_type", type);

  // Fetch with limit for pagination
  const { data: all, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = all ?? [];

  // Enrich with user emails
  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
  const emailMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authData?.users ?? []) {
      if (userIds.includes(u.id)) emailMap.set(u.id, u.email ?? "");
    }
  }

  const enriched = rows.map((r) => ({
    ...r,
    user_email: r.user_id ? (emailMap.get(r.user_id) ?? null) : null,
  }));

  // Stats
  const stats = {
    total: enriched.length,
    types: enriched.reduce<Record<string, number>>((acc, r) => {
      acc[r.error_type] = (acc[r.error_type] ?? 0) + 1;
      return acc;
    }, {}),
  };

  const total  = enriched.length;
  const offset = (page - 1) * limit;
  const items  = enriched.slice(offset, offset + limit);

  return NextResponse.json({ items, total, stats });
}
