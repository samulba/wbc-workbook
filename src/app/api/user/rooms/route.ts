import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/user/rooms
// Returns user's projects with their rooms (for moodboard picker).

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, rooms (id, name, room_type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
