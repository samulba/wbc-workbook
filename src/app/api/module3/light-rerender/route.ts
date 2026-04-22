import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { gptImage1CostMicros } from "@/lib/ai/pricing";

const DAILY_LIMIT = 10;
const BUCKET      = "moodboards";

const ROOM_EN: Record<string, string> = {
  wohnzimmer: "living room", schlafzimmer: "bedroom",
  arbeitszimmer: "home office", kinderzimmer: "children's room",
  badezimmer: "bathroom", kueche: "kitchen",
  esszimmer: "dining room", flur: "hallway",
  keller: "basement", buero: "office",
  yogaraum: "yoga room", wellness: "wellness room",
  studio: "studio", sonstiges: "room",
};

function kelvinFromWarmth(warmth: number): number {
  // 0 → 6000K (cool), 100 → 2200K (warm)
  return Math.round(6000 - (warmth / 100) * 3800);
}

function brightnessLabel(b: number): string {
  if (b < 30) return "heavily dimmed, intimate low ambient brightness";
  if (b < 55) return "softly dimmed, gentle ambient brightness";
  if (b < 75) return "balanced comfortable brightness";
  return "bright, fully illuminated";
}

function warmthLabel(w: number): string {
  if (w < 25) return "cool bluish daylight";
  if (w < 45) return "neutral daylight";
  if (w < 70) return "warm white";
  return "warm amber candlelight-like";
}

function buildPrompt(roomType: string, warmth: number, brightness: number): string {
  const roomEn  = ROOM_EN[roomType] ?? "room";
  const kelvin  = kelvinFromWarmth(warmth);
  const wLabel  = warmthLabel(warmth);
  const bLabel  = brightnessLabel(brightness);

  return [
    `Re-light this exact ${roomEn} keeping the identical furniture, layout, walls, floor, windows and composition.`,
    `Change ONLY the lighting: approximately ${kelvin} Kelvin color temperature (${wLabel}), ${bLabel}.`,
    `Realistic photographic quality, natural shadows consistent with the room.`,
    `No changes to decor, no people, no text, no watermark.`,
  ].join(" ");
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mime: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch base image (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") ?? "image/png";
  return { base64: buf.toString("base64"), mime };
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // 2. Parse body
  let body: {
    moduleId:     string;
    projectId:    string;
    roomId:       string;
    roomType:     string;
    baseImageUrl: string;
    warmth:       number;
    brightness:   number;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { moduleId, projectId, roomId, roomType, baseImageUrl, warmth, brightness } = body;
  if (!moduleId || !projectId || !roomId || !roomType || !baseImageUrl ||
      typeof warmth !== "number" || typeof brightness !== "number") {
    return NextResponse.json({ error: "Fehlende Parameter." }, { status: 400 });
  }

  // 3. Ownership
  const { data: projectCheck } = await supabase
    .from("projects").select("id").eq("id", projectId).eq("user_id", user.id).single();
  if (!projectCheck) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  const { data: roomCheck } = await supabase
    .from("rooms").select("id, project_id").eq("id", roomId).eq("project_id", projectId).single();
  if (!roomCheck) {
    return NextResponse.json({ error: "Raum nicht gefunden." }, { status: 404 });
  }

  // 4. Rate limit (separate from general render counter)
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_light_studio_count, light_studio_reset_date")
    .eq("id", user.id)
    .single();

  const today     = new Date().toISOString().slice(0, 10);
  const isNewDay  = !profile?.light_studio_reset_date || profile.light_studio_reset_date !== today;
  const current   = isNewDay ? 0 : (profile?.daily_light_studio_count ?? 0);

  if (current >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Tageslimit von ${DAILY_LIMIT} Light-Studio-Renderings erreicht. Morgen geht es weiter!`, rateLimited: true },
      { status: 429 },
    );
  }

  await supabase
    .from("profiles")
    .update({ daily_light_studio_count: current + 1, light_studio_reset_date: today })
    .eq("id", user.id);

  // 5. OpenAI key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await supabase.from("profiles").update({ daily_light_studio_count: current }).eq("id", user.id);
    return NextResponse.json({ error: "Visualisierung nicht konfiguriert (API-Key fehlt)." }, { status: 500 });
  }

  // 6. Fetch base image bytes
  let imageBase64: string;
  let mime: string;
  try {
    const fetched = await fetchImageAsBase64(baseImageUrl);
    imageBase64 = fetched.base64;
    mime        = fetched.mime;
  } catch (err) {
    console.error("Light Studio base image fetch error:", err);
    await supabase.from("profiles").update({ daily_light_studio_count: current }).eq("id", user.id);
    return NextResponse.json({ error: "Basis-Bild konnte nicht geladen werden." }, { status: 502 });
  }

  // 7. Call OpenAI
  const client = new OpenAI({ apiKey });
  const prompt = buildPrompt(roomType, warmth, brightness);
  const ext    = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";

  let renderedBase64: string;
  try {
    const inputImage = await toFile(
      Buffer.from(imageBase64, "base64"),
      `base.${ext}`,
      { type: mime },
    );

    const result = await client.images.edit({
      model:   "gpt-image-1",
      image:   inputImage,
      prompt,
      size:    "1024x1024",
      quality: "medium",
      n:       1,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      await supabase.from("profiles").update({ daily_light_studio_count: current }).eq("id", user.id);
      return NextResponse.json({ error: "Kein Ergebnis von der KI. Bitte erneut versuchen." }, { status: 502 });
    }
    renderedBase64 = b64;
  } catch (err) {
    console.error("OpenAI light-studio edit error:", err);
    await supabase.from("profiles").update({ daily_light_studio_count: current }).eq("id", user.id);
    return NextResponse.json({ error: "Verbindung zur KI fehlgeschlagen. Bitte erneut versuchen." }, { status: 502 });
  }

  // 8. Upload result (admin client bypasses RLS, ownership already verified)
  const admin       = createAdminClient();
  const slug        = Math.random().toString(36).slice(2, 8);
  const storagePath = `${user.id}/${projectId}/${roomId}/light-studio/${Date.now()}-${slug}.png`;
  const pngBuffer   = Buffer.from(renderedBase64, "base64");

  const { data: uploadData, error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(pngBuffer), { contentType: "image/png", upsert: false });

  if (uploadError || !uploadData) {
    console.error("Light Studio upload error:", uploadError, "size:", pngBuffer.length);
    await supabase.from("profiles").update({ daily_light_studio_count: current }).eq("id", user.id);
    return NextResponse.json(
      { error: `Bild konnte nicht gespeichert werden (${uploadError?.message ?? "unbekannt"}).` },
      { status: 500 },
    );
  }

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(uploadData.path);

  // 9. Append to module3_analysis.studio_render_urls (admin client — ownership verified)
  const { data: m3 } = await admin
    .from("module3_analysis")
    .select("studio_render_urls")
    .eq("id", moduleId)
    .single();

  const existingRenders = (m3?.studio_render_urls as string[] | null) ?? [];
  await admin
    .from("module3_analysis")
    .update({
      studio_render_urls: [...existingRenders, publicUrl],
      light_warmth:       warmth,
      light_brightness:   brightness,
      updated_at:         new Date().toISOString(),
    })
    .eq("id", moduleId);

  // 10. Log usage (fire-and-forget)
  const costMicros = gptImage1CostMicros("1024x1024", "medium", 1);
  admin
    .from("ai_usage")
    .insert({
      user_id:     user.id,
      endpoint:    "light-rerender",
      model:       "gpt-image-1",
      image_count: 1,
      cost_micros: costMicros,
      metadata:    { roomId, projectId, roomType, warmth, brightness, size: "1024x1024", quality: "medium" },
    })
    .then(({ error }) => { if (error) console.error("ai_usage insert (light-studio):", error); });

  const remaining = DAILY_LIMIT - (current + 1);
  return NextResponse.json({ imageUrl: publicUrl, remaining });
}
