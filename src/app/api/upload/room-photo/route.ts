import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "moodboards"; // reuse same bucket, different sub-paths

// ── POST /api/upload/room-photo ────────────────────────────────────────────
// FormData: { file: File, projectId, roomId, type: "before"|"after", oldUrl?: string }
// Response: { url: string }
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const file      = formData.get("file");
  const projectId = formData.get("projectId");
  const roomId    = formData.get("roomId");
  const type      = formData.get("type");
  const oldUrl    = formData.get("oldUrl") as string | null;

  if (
    !(file instanceof File) ||
    typeof projectId !== "string" ||
    typeof roomId !== "string" ||
    (type !== "before" && type !== "after")
  ) {
    return NextResponse.json({ error: "Fehlende oder ungültige Parameter." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Nur JPG, PNG und WebP erlaubt." }, { status: 422 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Datei zu groß. Maximal 5 MB erlaubt." }, { status: 422 });
  }

  // Delete old file from storage (cleanup before uploading new one)
  if (oldUrl) {
    const MARKER = `/object/public/${BUCKET}/`;
    const idx = oldUrl.indexOf(MARKER);
    if (idx !== -1) {
      const oldPath = oldUrl.slice(idx + MARKER.length);
      if (oldPath.startsWith(`${user.id}/`)) {
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
    }
  }

  const ext  = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const slug = Math.random().toString(36).slice(2, 8);
  const path = `${user.id}/${projectId}/${roomId}/${type}-${Date.now()}-${slug}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(bytes), { contentType: file.type, upsert: false });

  if (error) {
    console.error("Room photo upload error:", error);
    return NextResponse.json(
      { error: "Upload fehlgeschlagen. Bitte erneut versuchen." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}

// ── DELETE /api/upload/room-photo ──────────────────────────────────────────
// Body: { url: string }
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { url } = body;
  if (!url) return NextResponse.json({ error: "URL fehlt." }, { status: 400 });

  const MARKER = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(MARKER);
  if (idx === -1) return NextResponse.json({ error: "Ungültige URL." }, { status: 400 });

  const storagePath = url.slice(idx + MARKER.length);
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    console.error("Room photo delete error:", error);
    return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
