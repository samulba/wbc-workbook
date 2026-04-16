import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// ── GET /api/admin/feedback/unread-count ─────────────────────────────────────

export async function GET() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ count: 0 });

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("user_feedback")
    .select("*", { count: "exact", head: true })
    .eq("status", "neu");

  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: count ?? 0 });
}
