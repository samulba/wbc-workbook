import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Query params: search, role, period, sortBy, sortDir, page, limit

export async function GET(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp     = new URL(req.url).searchParams;
  const search = sp.get("search") ?? "";
  const role   = sp.get("role")   ?? "";
  const period = sp.get("period") ?? "";
  const sortBy   = sp.get("sortBy")  ?? "created_at";
  const sortDir  = (sp.get("sortDir") ?? "desc") as "asc" | "desc";
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(sp.get("limit") ?? "20"));

  const admin = createAdminClient();

  // 1. Fetch all profiles
  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, role, is_active, created_at, updated_at");
  if (profilesErr) return NextResponse.json({ error: profilesErr.message }, { status: 500 });

  // 2. Fetch all project user_ids for counting
  const { data: allProjects } = await admin.from("projects").select("user_id");
  const projectCounts = new Map<string, number>();
  for (const p of allProjects ?? []) {
    projectCounts.set(p.user_id, (projectCounts.get(p.user_id) ?? 0) + 1);
  }

  // 3. Fetch auth users (email, last_sign_in_at) – paginated up to 10k
  const authMap = new Map<string, { email: string; last_sign_in_at: string | null }>();
  let authPage = 1;
  while (true) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000, page: authPage });
    if (!authData?.users?.length) break;
    for (const u of authData.users) {
      authMap.set(u.id, {
        email:            u.email ?? "",
        last_sign_in_at:  (u.last_sign_in_at as string | null | undefined) ?? null,
      });
    }
    if (authData.users.length < 1000) break;
    authPage++;
  }

  // 4. Merge
  const merged = (profiles ?? []).map(p => {
    const auth = authMap.get(p.id) ?? { email: "", last_sign_in_at: null };
    return {
      id:              p.id,
      full_name:       p.full_name   as string | null,
      avatar_url:      p.avatar_url  as string | null,
      role:            p.role        as string,
      is_active:       p.is_active   as boolean ?? true,
      created_at:      p.created_at  as string,
      updated_at:      p.updated_at  as string,
      email:           auth.email,
      last_sign_in_at: auth.last_sign_in_at,
      project_count:   projectCounts.get(p.id) ?? 0,
    };
  });

  // 5. Stats (always over full dataset)
  const now      = Date.now();
  const weekMs   = 7  * 24 * 60 * 60 * 1000;
  const monthMs  = 30 * 24 * 60 * 60 * 1000;
  const stats = {
    total:         merged.length,
    new_this_week: merged.filter(u => now - new Date(u.created_at).getTime() < weekMs).length,
    admins:        merged.filter(u => u.role === "admin").length,
    inactive:      merged.filter(u => !u.is_active).length,
  };

  // 6. Filter
  let filtered = merged;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.full_name?.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  }
  if (role) filtered = filtered.filter(u => u.role === role);
  if (period === "7d")  filtered = filtered.filter(u => now - new Date(u.created_at).getTime() < weekMs);
  if (period === "30d") filtered = filtered.filter(u => now - new Date(u.created_at).getTime() < monthMs);

  // 7. Sort
  filtered.sort((a, b) => {
    let va: string | number, vb: string | number;
    switch (sortBy) {
      case "full_name":       va = a.full_name ?? ""; vb = b.full_name ?? ""; break;
      case "email":           va = a.email;           vb = b.email;           break;
      case "role":            va = a.role;            vb = b.role;            break;
      case "project_count":   va = a.project_count;   vb = b.project_count;   break;
      case "last_sign_in_at": va = a.last_sign_in_at ?? ""; vb = b.last_sign_in_at ?? ""; break;
      default:                va = a.created_at;      vb = b.created_at;
    }
    if (va === vb) return 0;
    const cmp = va < vb ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // 8. Paginate
  const total     = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ users: paginated, total, stats });
}
