import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

// ── PATCH /api/admin/users/[id] ───────────────────────────────────────────────
// Body: { role?: string } | { is_active?: boolean }

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if ("role"      in body) updates.role      = body.role;
  if ("is_active" in body) updates.is_active = body.is_active;
  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", params.id)
    .select("id, full_name, role, is_active")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// ── DELETE /api/admin/users/[id] ──────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prevent self-deletion
  const supabase = createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  if (me?.id === params.id) {
    return NextResponse.json({ error: "Eigenen Account nicht löschbar" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
