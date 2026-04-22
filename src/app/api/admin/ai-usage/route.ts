import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

type Window = { label: string; since: string };

interface UsageRow {
  endpoint:      string;
  model:         string;
  input_tokens:  number;
  output_tokens: number;
  image_count:   number;
  cost_micros:   number;
  created_at:    string;
  user_id:       string | null;
}

interface Bucket {
  calls:   number;
  input:   number;
  output:  number;
  images:  number;
  micros:  number;
}

function emptyBucket(): Bucket { return { calls: 0, input: 0, output: 0, images: 0, micros: 0 }; }

function addRow(b: Bucket, r: UsageRow): Bucket {
  b.calls  += 1;
  b.input  += r.input_tokens;
  b.output += r.output_tokens;
  b.images += r.image_count;
  b.micros += Number(r.cost_micros);
  return b;
}

export async function GET() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const now = new Date();
  const windows: Record<string, Window> = {
    today:    { label: "Heute",             since: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString() },
    last7d:   { label: "Letzte 7 Tage",     since: new Date(now.getTime() - 7  * 24 * 3600 * 1000).toISOString() },
    last30d:  { label: "Letzte 30 Tage",    since: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString() },
    allTime:  { label: "Gesamt",            since: "1970-01-01T00:00:00Z" },
  };

  // Pull raw rows for the largest window (30d + allTime handled via separate "gesamt")
  const [{ data: recent30 }, { data: allSummary }, { data: latest }] = await Promise.all([
    admin
      .from("ai_usage")
      .select("endpoint, model, input_tokens, output_tokens, image_count, cost_micros, created_at, user_id")
      .gte("created_at", windows.last30d.since)
      .order("created_at", { ascending: false }),
    admin
      .from("ai_usage")
      .select("cost_micros, input_tokens, output_tokens, image_count"),
    admin
      .from("ai_usage")
      .select("id, created_at, user_id, endpoint, model, input_tokens, output_tokens, image_count, cost_micros, metadata")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const rows = (recent30 ?? []) as UsageRow[];

  // Summaries per window
  const today    = emptyBucket();
  const last7d   = emptyBucket();
  const last30d  = emptyBucket();
  const since7   = windows.last7d.since;
  const sinceToday = windows.today.since;

  for (const r of rows) {
    addRow(last30d, r);
    if (r.created_at >= since7)     addRow(last7d, r);
    if (r.created_at >= sinceToday) addRow(today, r);
  }

  // All-time (reduce separately — no date filter)
  const allTime = emptyBucket();
  for (const r of (allSummary ?? []) as Pick<UsageRow, "input_tokens" | "output_tokens" | "image_count" | "cost_micros">[]) {
    allTime.calls  += 1;
    allTime.input  += r.input_tokens;
    allTime.output += r.output_tokens;
    allTime.images += r.image_count;
    allTime.micros += Number(r.cost_micros);
  }

  // Breakdown by endpoint over 30d
  const byEndpoint: Record<string, Bucket> = {};
  for (const r of rows) {
    const key = r.endpoint;
    if (!byEndpoint[key]) byEndpoint[key] = emptyBucket();
    addRow(byEndpoint[key], r);
  }

  // Top users (last 30d, by cost)
  const byUser: Map<string, Bucket> = new Map();
  for (const r of rows) {
    if (!r.user_id) continue;
    const b = byUser.get(r.user_id) ?? emptyBucket();
    addRow(b, r);
    byUser.set(r.user_id, b);
  }
  const topUserIds = Array.from(byUser.entries())
    .sort((a, b) => b[1].micros - a[1].micros)
    .slice(0, 10);

  // Hydrate top users with email (auth.users, reachable via service-role admin client)
  let topUsers: { userId: string; email: string | null; bucket: Bucket }[] = [];
  if (topUserIds.length > 0) {
    const wanted = new Set(topUserIds.map(([id]) => id));
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map<string, string | null>();
    for (const u of list?.users ?? []) {
      if (wanted.has(u.id)) emailMap.set(u.id, u.email ?? null);
    }
    topUsers = topUserIds.map(([userId, bucket]) => ({
      userId,
      email:  emailMap.get(userId) ?? null,
      bucket,
    }));
  }

  // Daily series for last 30 days (for mini chart)
  const dailyMap = new Map<string, Bucket>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, emptyBucket());
  }
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    const b = dailyMap.get(key);
    if (b) addRow(b, r);
  }
  const daily = Array.from(dailyMap.entries()).map(([day, bucket]) => ({ day, ...bucket }));

  return NextResponse.json({
    checkedAt: now.toISOString(),
    totals: {
      today,
      last7d,
      last30d,
      allTime,
    },
    byEndpoint,
    topUsers,
    daily,
    recent: (latest ?? []).map((r) => ({
      id:            r.id,
      createdAt:     r.created_at,
      userId:        r.user_id,
      endpoint:      r.endpoint,
      model:         r.model,
      inputTokens:   r.input_tokens,
      outputTokens:  r.output_tokens,
      imageCount:    r.image_count,
      costMicros:    Number(r.cost_micros),
      metadata:      r.metadata,
    })),
  });
}
