import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── DELETE /api/admin/error-logs/cleanup ─────────────────────────────────────
// Deletes all error_logs older than 30 days

export async function DELETE() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
  const admin  = createAdminClient();

  const { data, error } = await admin
    .from("error_logs")
    .delete()
    .lt("created_at", cutoff)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: data?.length ?? 0 });
}
