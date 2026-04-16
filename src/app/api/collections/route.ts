import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/collections  →  list user's collections
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { data, error } = await supabase
    .from("inspiration_collections")
    .select("id, name, description, cover_url, item_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/collections  →  create a collection
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { name, description } = await req.json() as { name: string; description?: string };
  if (!name?.trim()) return NextResponse.json({ error: "Name fehlt" }, { status: 400 });

  const { data, error } = await supabase
    .from("inspiration_collections")
    .insert({ user_id: user.id, name: name.trim(), description: description?.trim() || null })
    .select("id, name, description, cover_url, item_count, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
