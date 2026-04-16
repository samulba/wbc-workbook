import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── PATCH /api/admin/feedback/[id] ───────────────────────────────────────────
// Body: { status?, admin_response? }

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { status, admin_response } = body;

  const VALID_STATUS = ["neu", "gelesen", "erledigt"];
  const updates: Record<string, unknown> = {};
  if (status !== undefined) {
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
    }
    updates.status = status;
  }
  if (admin_response !== undefined) updates.admin_response = admin_response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_feedback")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// ── DELETE /api/admin/feedback/[id] ──────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_feedback")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
