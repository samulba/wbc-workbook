import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST /api/feedback-share/submit
// Public: no auth required. Token + content validated server-side; the
// submit_feedback_response RPC enforces link validity (active + not expired).

export async function POST(req: NextRequest) {
  let body: { token?: unknown; name?: unknown; message?: unknown; rating?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Ungültige Anfrage." }, { status: 400 }); }

  const token   = typeof body.token   === "string" ? body.token   : "";
  const name    = typeof body.name    === "string" ? body.name.trim().slice(0, 60) : null;
  const message = typeof body.message === "string" ? body.message : "";
  const rating  = typeof body.rating  === "number" ? body.rating  : null;

  if (!token) {
    return NextResponse.json({ ok: false, error: "Ungültiger Link." }, { status: 400 });
  }
  if (!message.trim()) {
    return NextResponse.json({ ok: false, error: "Bitte schreibe eine Nachricht." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ ok: false, error: "Nachricht zu lang (max 2000 Zeichen)." }, { status: 400 });
  }
  if (rating !== null && (rating < 1 || rating > 5)) {
    return NextResponse.json({ ok: false, error: "Ungültige Bewertung." }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("submit_feedback_response", {
    p_token:   token,
    p_name:    name,
    p_message: message,
    p_rating:  rating,
  });

  if (error) {
    console.error("submit_feedback_response:", error);
    return NextResponse.json({ ok: false, error: "Feedback konnte nicht gespeichert werden." }, { status: 500 });
  }

  if (data !== true) {
    return NextResponse.json(
      { ok: false, error: "Der Link ist nicht mehr aktiv oder abgelaufen." },
      { status: 410 },
    );
  }

  return NextResponse.json({ ok: true });
}
