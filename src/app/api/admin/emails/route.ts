import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/emails ─────────────────────────────────────────────────────
// Query params: search, filter (all|active|inactive), sortBy, sortDir, format (csv)

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp      = new URL(req.url).searchParams;
  const search  = sp.get("search")?.trim().toLowerCase() ?? "";
  const filter  = sp.get("filter")  ?? "all";   // all | active | inactive
  const sortBy  = sp.get("sortBy")  ?? "created_at";
  const sortDir = (sp.get("sortDir") ?? "desc") as "asc" | "desc";
  const format  = sp.get("format")  ?? "json";  // json | csv

  const admin = createAdminClient();

  // 1. Profiles
  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select("id, full_name, is_active, created_at");
  if (profilesErr) return NextResponse.json({ error: profilesErr.message }, { status: 500 });

  // 2. Project counts
  const { data: allProjects } = await admin.from("projects").select("user_id");
  const projectCounts = new Map<string, number>();
  for (const p of allProjects ?? []) {
    projectCounts.set(p.user_id, (projectCounts.get(p.user_id) ?? 0) + 1);
  }

  // 3. Auth users (email + last_sign_in_at)
  const authMap = new Map<string, { email: string; last_sign_in_at: string | null }>();
  let authPage = 1;
  while (true) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000, page: authPage });
    if (!authData?.users?.length) break;
    for (const u of authData.users) {
      authMap.set(u.id, {
        email:           u.email ?? "",
        last_sign_in_at: (u.last_sign_in_at as string | null | undefined) ?? null,
      });
    }
    if (authData.users.length < 1000) break;
    authPage++;
  }

  // 4. Merge
  const now30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const rows = (profiles ?? []).map((p) => {
    const auth = authMap.get(p.id) ?? { email: "", last_sign_in_at: null };
    const last  = auth.last_sign_in_at ? new Date(auth.last_sign_in_at).getTime() : 0;
    return {
      id:              p.id,
      email:           auth.email,
      full_name:       p.full_name   as string | null,
      is_active:       p.is_active   as boolean,
      created_at:      p.created_at  as string,
      last_sign_in_at: auth.last_sign_in_at,
      project_count:   projectCounts.get(p.id) ?? 0,
      recently_active: last > now30,
    };
  });

  // Stats (on full set)
  const stats = {
    total:    rows.length,
    active:   rows.filter((r) => r.recently_active).length,
    inactive: rows.filter((r) => !r.recently_active).length,
  };

  // 5. Filter
  let filtered = rows;
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.email.toLowerCase().includes(search) ||
        (r.full_name?.toLowerCase() ?? "").includes(search)
    );
  }
  if (filter === "active")   filtered = filtered.filter((r) => r.recently_active);
  if (filter === "inactive") filtered = filtered.filter((r) => !r.recently_active);

  // 6. Sort
  filtered.sort((a, b) => {
    let va: string | number | boolean | null = null;
    let vb: string | number | boolean | null = null;
    switch (sortBy) {
      case "email":           va = a.email;           vb = b.email;           break;
      case "full_name":       va = a.full_name ?? ""; vb = b.full_name ?? ""; break;
      case "project_count":   va = a.project_count;   vb = b.project_count;   break;
      case "last_sign_in_at": va = a.last_sign_in_at ?? ""; vb = b.last_sign_in_at ?? ""; break;
      default:                va = a.created_at;      vb = b.created_at;
    }
    if (va === vb) return 0;
    const cmp = va < vb ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // 7. CSV export
  if (format === "csv") {
    const dsgvo = "# DSGVO-Hinweis: Nur fuer legitime Geschaeftszwecke verwenden.\r\n";
    const header = "Email,Name,Registriert,Letzte Aktivitaet,Projekte\r\n";
    const body = filtered.map((r) => [
      `"${r.email}"`,
      `"${r.full_name ?? ""}"`,
      `"${r.created_at.slice(0, 10)}"`,
      `"${r.last_sign_in_at?.slice(0, 10) ?? ""}"`,
      r.project_count,
    ].join(",")).join("\r\n");
    const csv = dsgvo + header + body;
    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="email-liste-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ rows: filtered, stats });
}
