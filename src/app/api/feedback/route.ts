import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { checkAndUnlockAchievements } from "@/lib/achievements/service";

// ── POST /api/feedback ────────────────────────────────────────────────────────
// Body: { type, message, page_url?, rating? }

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { type, message, page_url, rating } = body;

  const VALID_TYPES = ["Bug", "Vorschlag", "Lob", "Frage"];
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: "Nachricht fehlt" }, { status: 400 });
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return NextResponse.json({ error: "Rating muss zwischen 1 und 5 liegen" }, { status: 400 });
  }

  // Use admin client to bypass RLS for insert (the INSERT policy still enforces user_id = auth.uid())
  // Actually we use service role here so we can write; the user_id is set to the authenticated user's id.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_feedback")
    .insert({
      user_id:  user.id,
      type,
      message:  message.trim(),
      page_url: page_url?.trim() || null,
      rating:   typeof rating === "number" ? rating : null,
      status:   "neu",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await checkAndUnlockAchievements(user.id, "feedback_submitted").catch(() => {});

  return NextResponse.json({ id: data.id }, { status: 201 });
}
