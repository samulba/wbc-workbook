import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function bucketByDay(dates: string[], startIso: string, endDate: Date) {
  const counts = new Map<string, number>();
  for (const d of dates) {
    const key = d.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const result: { date: string; count: number }[] = [];
  const cur = new Date(startIso);
  cur.setUTCHours(0, 0, 0, 0);
  const endKey = endDate.toISOString().slice(0, 10);
  while (cur.toISOString().slice(0, 10) <= endKey) {
    const key = cur.toISOString().slice(0, 10);
    result.push({ date: key, count: counts.get(key) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return result;
}

function bucketByHour(dates: string[]) {
  const counts = new Map<string, number>();
  for (const d of dates) {
    const h = new Date(d).getUTCHours();
    const key = `${String(h).padStart(2, "0")}:00`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from({ length: 24 }, (_, h) => {
    const key = `${String(h).padStart(2, "0")}:00`;
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

function bucketByMonth(dates: string[]) {
  const counts = new Map<string, number>();
  for (const d of dates) {
    const dt = new Date(d);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (!counts.size) return [];
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}

const EFFECT_LABELS: Record<string, string> = {
  ruhe_erholung:            "Ruhe & Erholung",
  fokus_konzentration:      "Fokus & Konzentration",
  energie_aktivitaet:       "Energie & Aktivität",
  kreativitaet_inspiration: "Kreativität",
  begegnung_austausch:      "Begegnung",
};

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer:    "Wohnzimmer",
  schlafzimmer:  "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer",
  kueche:        "Küche",
  badezimmer:    "Bad",
  esszimmer:     "Esszimmer",
  yogaraum:      "Yogaraum",
  kinderzimmer:  "Kinderzimmer",
  flur:          "Flur",
  keller:        "Keller",
  buero:         "Büro",
  wellness:      "Wellness",
  studio:        "Studio",
  sonstiges:     "Sonstiges",
};

// ── GET /api/admin/analytics?period=7d ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = new URL(req.url).searchParams.get("period") ?? "7d";
  const admin  = createAdminClient();
  const now    = new Date();

  // ── Period boundaries ──────────────────────────────────────────────────────
  let start:     Date;
  let prevStart: Date | null = null;
  let prevEnd:   Date | null = null;

  switch (period) {
    case "today":
      start     = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      prevStart = new Date(start.getTime() - 86_400_000);
      prevEnd   = start;
      break;
    case "7d":
      start     = new Date(now.getTime() - 7  * 86_400_000);
      prevStart = new Date(now.getTime() - 14 * 86_400_000);
      prevEnd   = start;
      break;
    case "30d":
      start     = new Date(now.getTime() - 30 * 86_400_000);
      prevStart = new Date(now.getTime() - 60 * 86_400_000);
      prevEnd   = start;
      break;
    default: // all
      start = new Date(0);
  }

  const startStr    = start.toISOString();
  const prevStartStr = prevStart?.toISOString();
  const prevEndStr   = prevEnd?.toISOString();

  // ── Parallel data fetch ────────────────────────────────────────────────────
  const [
    { data: profiles },
    { data: projects },
    { data: bookings },
    { data: analyses },
    { data: rooms },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, created_at"),
    admin.from("projects").select("id, user_id, status, created_at"),
    admin.from("coaching_bookings").select("id, created_at"),
    admin.from("module1_analysis").select("main_effect, primary_colors, materials"),
    admin.from("rooms").select("room_type"),
  ]);

  // ── KPI ────────────────────────────────────────────────────────────────────
  const allProfiles  = profiles  ?? [];
  const allProjects  = projects  ?? [];
  const allBookings  = bookings  ?? [];
  const allAnalyses  = analyses  ?? [];
  const allRooms     = rooms     ?? [];

  const totalUsers = allProfiles.length;
  const newUsers   = allProfiles.filter(p => p.created_at >= startStr).length;
  const prevUsers  = prevStartStr
    ? allProfiles.filter(p => p.created_at >= prevStartStr && p.created_at < prevEndStr!).length
    : null;

  const totalProjects     = allProjects.length;
  const newProjects       = allProjects.filter(p => p.created_at >= startStr).length;
  const completedProjects = allProjects.filter(p => p.status === "abgeschlossen").length;
  const completionRate    = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const periodBookings = allBookings.filter(b => b.created_at >= startStr).length;
  const prevBookings   = prevStartStr
    ? allBookings.filter(b => b.created_at >= prevStartStr && b.created_at < prevEndStr!).length
    : null;

  // ── Time series ────────────────────────────────────────────────────────────
  const regDates  = allProfiles.filter(p => p.created_at >= startStr).map(p => p.created_at as string);
  const projDates = allProjects.filter(p => p.created_at >= startStr).map(p => p.created_at as string);

  let registrations:      { date: string; count: number }[];
  let projects_created:   { date: string; count: number }[];

  if (period === "today") {
    registrations    = bucketByHour(regDates);
    projects_created = bucketByHour(projDates);
  } else if (period === "all") {
    // all dates
    const allRegDates  = allProfiles.map(p => p.created_at as string);
    const allProjDates = allProjects.map(p => p.created_at as string);
    registrations    = bucketByMonth(allRegDates);
    projects_created = bucketByMonth(allProjDates);
  } else {
    registrations    = bucketByDay(regDates, startStr, now);
    projects_created = bucketByDay(projDates, startStr, now);
  }

  // ── Aggregations ───────────────────────────────────────────────────────────
  const effectCounts   = new Map<string, number>();
  const materialCounts = new Map<string, number>();
  const colorCounts    = new Map<string, number>();
  const typeCounts     = new Map<string, number>();

  for (const a of allAnalyses) {
    const eff = a.main_effect as string | null;
    if (eff) effectCounts.set(eff, (effectCounts.get(eff) ?? 0) + 1);
    for (const m of (a.materials ?? []) as string[])       if (m.trim()) materialCounts.set(m.trim(), (materialCounts.get(m.trim()) ?? 0) + 1);
    for (const c of (a.primary_colors ?? []) as string[])  if (c.trim()) colorCounts.set(c.trim(),    (colorCounts.get(c.trim())    ?? 0) + 1);
  }
  for (const r of allRooms) {
    const rt = r.room_type as string;
    if (rt) typeCounts.set(rt, (typeCounts.get(rt) ?? 0) + 1);
  }

  const room_effects = Array.from(effectCounts.entries())
    .map(([k, v]) => ({ name: EFFECT_LABELS[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value);

  const room_types = Array.from(typeCounts.entries())
    .map(([k, v]) => ({ name: ROOM_LABELS[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ── Top users ──────────────────────────────────────────────────────────────
  const projByUser = new Map<string, number>();
  for (const p of allProjects) {
    const uid = p.user_id as string;
    projByUser.set(uid, (projByUser.get(uid) ?? 0) + 1);
  }
  const topIds = Array.from(projByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  // Fetch emails for top users
  const emailMap = new Map<string, string>();
  await Promise.all(
    topIds.map(async id => {
      const { data } = await admin.auth.admin.getUserById(id);
      if (data.user?.email) emailMap.set(id, data.user.email);
    })
  );

  const top_users = topIds.map(id => {
    const p = allProfiles.find(x => x.id === id);
    return {
      id,
      full_name:     (p?.full_name as string | null) ?? null,
      email:         emailMap.get(id) ?? "",
      project_count: projByUser.get(id) ?? 0,
    };
  });

  // ── Top materials + colors ─────────────────────────────────────────────────
  const top_materials = Array.from(materialCounts.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const top_colors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([hex, count]) => ({ hex, count }));

  return NextResponse.json({
    kpi: {
      total_users:        totalUsers,
      new_users:          newUsers,
      new_users_change:   prevUsers !== null ? pctChange(newUsers, prevUsers) : null,
      total_projects:     totalProjects,
      new_projects:       newProjects,
      completed_projects: completedProjects,
      completion_rate:    completionRate,
      coaching_bookings:  periodBookings,
      coaching_change:    prevBookings !== null ? pctChange(periodBookings, prevBookings) : null,
    },
    registrations,
    projects_created,
    room_effects,
    room_types,
    top_users,
    top_materials,
    top_colors,
  });
}
