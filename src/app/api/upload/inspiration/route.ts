import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET  = "moodboards";
const MAX_MB  = 10;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const form = await req.formData();
  const file       = form.get("file")     as File | null;
  const title      = (form.get("title")    as string | null)?.trim() || null;
  const effect     = (form.get("effect")   as string | null) || null;
  const roomType   = (form.get("roomType") as string | null) || null;
  const colorsRaw  = form.get("colors")   as string | null;

  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  if (file.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Datei zu groß (max ${MAX_MB} MB)` }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Nur Bilddateien erlaubt" }, { status: 400 });
  }

  const colors: string[] = colorsRaw ? JSON.parse(colorsRaw) : [];
  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `inspiration-uploads/${user.id}/${Date.now()}.${ext}`;

  // Upload to storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  // Save to inspiration_images (user-owned)
  const { data, error: dbError } = await supabase
    .from("inspiration_images")
    .insert({
      user_id:    user.id,
      image_url:  publicUrl,
      title,
      room_effect: effect,
      room_type:  roomType,
      colors,
      tags:       [],
    })
    .select("id, image_url, title, room_effect, room_type, colors, tags, created_at")
    .single();

  if (dbError) {
    // Clean up orphaned file
    await supabase.storage.from(BUCKET).remove([filename]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
