import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/inspiration/moodboard
// Body: { roomId: string; imageUrl: string }
// Appends imageUrl to module1_analysis.moodboard_urls for the given room.

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { roomId, imageUrl } = await req.json() as { roomId: string; imageUrl: string };
  if (!roomId || !imageUrl) {
    return NextResponse.json({ error: "roomId und imageUrl erforderlich" }, { status: 400 });
  }

  // Verify room ownership via projects
  const { data: roomRow } = await supabase
    .from("rooms")
    .select("project_id")
    .eq("id", roomId)
    .single();

  if (!roomRow) return NextResponse.json({ error: "Raum nicht gefunden" }, { status: 404 });

  const { data: projectRow } = await supabase
    .from("projects")
    .select("id")
    .eq("id", roomRow.project_id)
    .eq("user_id", user.id)
    .single();

  if (!projectRow) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  // Load current moodboard_urls
  const { data: m1 } = await supabase
    .from("module1_analysis")
    .select("id, moodboard_urls")
    .eq("room_id", roomId)
    .single();

  if (!m1) return NextResponse.json({ error: "Modul 1 nicht gefunden" }, { status: 404 });

  const current: string[] = m1.moodboard_urls ?? [];

  // Avoid duplicates; cap at 50
  if (current.includes(imageUrl)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const updated = [...current, imageUrl].slice(-50);

  const { error } = await supabase
    .from("module1_analysis")
    .update({ moodboard_urls: updated })
    .eq("id", m1.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
