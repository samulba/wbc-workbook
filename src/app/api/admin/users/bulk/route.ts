import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

// ── POST /api/admin/users/bulk ────────────────────────────────────────────────
// Body: { ids: string[]; action: "set_role" | "activate" | "deactivate"; role?: string }

export async function POST(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, action, role } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Prevent admin from bulk-deleting/modifying own account via bulk (safety)
  const supabase = createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  const safeIds = (ids as string[]).filter(id => id !== me?.id);
  if (safeIds.length === 0) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === "set_role") {
    if (!role) return NextResponse.json({ error: "role required" }, { status: 400 });
    const { error } = await admin.from("profiles").update({ role }).in("id", safeIds);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "activate") {
    const { error } = await admin.from("profiles").update({ is_active: true }).in("id", safeIds);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "deactivate") {
    const { error } = await admin.from("profiles").update({ is_active: false }).in("id", safeIds);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, affected: safeIds.length });
}
