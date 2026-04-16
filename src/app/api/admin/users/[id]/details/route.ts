import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── GET /api/admin/users/[id]/details ────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [
    { data: projects },
    { count: bookingsCount },
    { data: authUser },
  ] = await Promise.all([
    admin
      .from("projects")
      .select("id, name, status, created_at")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false }),
    admin
      .from("coaching_bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", params.id),
    admin.auth.admin.getUserById(params.id),
  ]);

  return NextResponse.json({
    projects:       projects      ?? [],
    bookings_count: bookingsCount ?? 0,
    email:          authUser.user?.email ?? "",
    last_sign_in:   (authUser.user?.last_sign_in_at as string | undefined) ?? null,
    confirmed_at:   (authUser.user?.email_confirmed_at as string | undefined) ?? null,
  });
}
