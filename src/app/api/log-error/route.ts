import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── POST /api/log-error ───────────────────────────────────────────────────────
// Called by client-side ErrorBoundary. Auth required (dashboard-only).
// Body: { error_type, message, stack_trace?, url? }

export async function POST(req: NextRequest) {
  // Only accept from authenticated users
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const message     = typeof body.message     === "string" ? body.message.slice(0, 2000) : "Unknown error";
  const error_type  = typeof body.error_type  === "string" ? body.error_type.slice(0, 100) : "client";
  const stack_trace = typeof body.stack_trace === "string" ? body.stack_trace.slice(0, 10000) : null;
  const url         = typeof body.url         === "string" ? body.url.slice(0, 500) : null;

  const admin = createAdminClient();
  await admin.from("error_logs").insert({
    error_type,
    message,
    stack_trace,
    user_id: user.id,
    url,
  });

  return NextResponse.json({ ok: true });
}
