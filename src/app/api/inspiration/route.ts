import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const effect   = searchParams.get("effect")   ?? "";
  const roomType = searchParams.get("roomType") ?? "";
  const color    = searchParams.get("color")    ?? "";
  const page     = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

  const supabase = createClient();

  let query = supabase
    .from("inspiration_images")
    .select("id, image_url, title, description, room_effect, room_type, colors, tags, source_url, created_at")
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (effect)   query = query.eq("room_effect", effect);
  if (roomType) query = query.eq("room_type",   roomType);
  if (color)    query = query.contains("colors", [color]);

  const { data, error } = await query;

  if (error) {
    console.error("Inspiration fetch error:", error);
    return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
