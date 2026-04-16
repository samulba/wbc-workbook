import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DAILY_LIMIT = 3;
const BUCKET = "moodboards";

const ROOM_EN: Record<string, string> = {
  wohnzimmer: "living room", schlafzimmer: "bedroom",
  arbeitszimmer: "home office", kinderzimmer: "children's room",
  badezimmer: "bathroom", kueche: "kitchen",
  esszimmer: "dining room", flur: "hallway",
  keller: "basement", buero: "office",
  yogaraum: "yoga room", wellness: "wellness room",
  studio: "studio", sonstiges: "room",
};

const EFFECT_EN: Record<string, string> = {
  ruhe_erholung:            "calm, peaceful and restorative",
  fokus_konzentration:      "focused, minimal and clear",
  energie_aktivitaet:       "energetic, vibrant and dynamic",
  kreativitaet_inspiration: "creative, inspiring and eclectic",
  begegnung_austausch:      "social, warm and inviting",
};

const LIGHT_EN: Record<string, string> = {
  warm_indirekt:    "warm indirect ambient lighting",
  hell_klar:        "bright clear natural lighting",
  beides_steuerbar: "flexible warm and bright adjustable lighting",
};

function buildPrompt(body: {
  roomType: string;
  mainEffect?: string;
  primaryColors?: string[];
  secondaryColors?: string[];
  accentColor?: string;
  materials?: string[];
  lightMood?: string;
  specialElements?: string;
}): string {
  const roomEn = ROOM_EN[body.roomType] ?? "room";
  const effectEn = body.mainEffect ? (EFFECT_EN[body.mainEffect] ?? body.mainEffect) : "elegant and harmonious";
  const lightEn = body.lightMood ? (LIGHT_EN[body.lightMood] ?? body.lightMood) : "soft natural lighting";

  const colors = [
    ...(body.primaryColors ?? []),
    ...(body.secondaryColors ?? []),
    body.accentColor,
  ].filter(Boolean) as string[];

  const materials = (body.materials ?? []).filter(Boolean);

  let prompt = `Professional interior design photograph of a ${roomEn}. `;
  prompt += `${effectEn.charAt(0).toUpperCase() + effectEn.slice(1)} atmosphere. `;

  if (colors.length > 0) {
    prompt += `Color palette: ${colors.join(", ")}. `;
  }
  if (materials.length > 0) {
    prompt += `Materials and textures: ${materials.join(", ")}. `;
  }
  prompt += `Lighting: ${lightEn}. `;
  if (body.specialElements) {
    prompt += `Special elements: ${body.specialElements}. `;
  }
  prompt += "Scandinavian wellness aesthetic, cozy and elegant, clean lines. ";
  prompt += "Professional interior photography, realistic, high resolution, soft natural light, 8k quality.";

  return prompt;
}

export async function POST(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────────
  let body: {
    imageBase64: string;
    mimeType: string;
    roomId: string;
    projectId: string;
    roomType: string;
    mainEffect?: string;
    primaryColors?: string[];
    secondaryColors?: string[];
    accentColor?: string;
    materials?: string[];
    lightMood?: string;
    specialElements?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { imageBase64, mimeType, roomId, projectId, roomType } = body;
  if (!imageBase64 || !mimeType || !roomId || !projectId || !roomType) {
    return NextResponse.json({ error: "Fehlende Parameter." }, { status: 400 });
  }

  // ── 3. Verify room ownership ─────────────────────────────────────────────────
  const { data: roomRow } = await supabase
    .from("rooms")
    .select("id, rendered_images")
    .eq("id", roomId)
    .single();

  if (!roomRow) {
    return NextResponse.json({ error: "Raum nicht gefunden." }, { status: 404 });
  }

  const { data: projectCheck } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!projectCheck) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  // ── 4. Rate limit ────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_render_count, render_reset_date")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = !profile?.render_reset_date || profile.render_reset_date !== today;
  const currentCount = isNewDay ? 0 : (profile?.daily_render_count ?? 0);

  if (currentCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Du hast dein Tageslimit von ${DAILY_LIMIT} Visualisierungen erreicht. Morgen geht es weiter!`, rateLimited: true },
      { status: 429 }
    );
  }

  // Increment before calling API
  await supabase
    .from("profiles")
    .update({ daily_render_count: currentCount + 1, render_reset_date: today })
    .eq("id", user.id);

  // ── 5. Check Stability API key ───────────────────────────────────────────────
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    await supabase.from("profiles").update({ daily_render_count: currentCount }).eq("id", user.id);
    return NextResponse.json({ error: "Visualisierung nicht konfiguriert (API-Key fehlt)." }, { status: 500 });
  }

  // ── 6. Call Stability AI SDXL img2img ────────────────────────────────────────
  const prompt = buildPrompt(body);
  const negativePrompt = "people, person, faces, text, watermark, logo, blurry, bad quality, cartoon, anime, illustration, painting, drawing";

  const imageBuffer = Buffer.from(imageBase64, "base64");

  const form = new FormData();
  form.append("init_image", new Blob([imageBuffer], { type: mimeType }), "room.jpg");
  form.append("text_prompts[0][text]", prompt);
  form.append("text_prompts[0][weight]", "1");
  form.append("text_prompts[1][text]", negativePrompt);
  form.append("text_prompts[1][weight]", "-1");
  form.append("image_strength", "0.65");
  form.append("cfg_scale", "7");
  form.append("steps", "30");
  form.append("samples", "1");

  let renderedBase64: string;
  try {
    const stabilityRes = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: form,
      }
    );

    if (!stabilityRes.ok) {
      const errBody = await stabilityRes.text().catch(() => "");
      console.error("Stability AI error:", stabilityRes.status, errBody);
      await supabase.from("profiles").update({ daily_render_count: currentCount }).eq("id", user.id);
      return NextResponse.json(
        { error: `Visualisierung fehlgeschlagen (${stabilityRes.status}). Bitte erneut versuchen.` },
        { status: 502 }
      );
    }

    const result = (await stabilityRes.json()) as { artifacts?: { base64: string; finishReason: string }[] };
    const artifact = result.artifacts?.[0];
    if (!artifact || artifact.finishReason !== "SUCCESS" || !artifact.base64) {
      await supabase.from("profiles").update({ daily_render_count: currentCount }).eq("id", user.id);
      return NextResponse.json({ error: "Kein Ergebnis von der KI. Bitte erneut versuchen." }, { status: 502 });
    }
    renderedBase64 = artifact.base64;
  } catch (err) {
    console.error("Stability AI call error:", err);
    await supabase.from("profiles").update({ daily_render_count: currentCount }).eq("id", user.id);
    return NextResponse.json({ error: "Verbindung zur KI fehlgeschlagen. Bitte erneut versuchen." }, { status: 502 });
  }

  // ── 7. Upload rendered image to Supabase Storage ─────────────────────────────
  const slug = Math.random().toString(36).slice(2, 8);
  const storagePath = `${user.id}/${projectId}/${roomId}/renders/${Date.now()}-${slug}.png`;
  const pngBuffer = Buffer.from(renderedBase64, "base64");

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(pngBuffer), { contentType: "image/png", upsert: false });

  if (uploadError || !uploadData) {
    console.error("Storage upload error:", uploadError);
    await supabase.from("profiles").update({ daily_render_count: currentCount }).eq("id", user.id);
    return NextResponse.json({ error: "Bild konnte nicht gespeichert werden." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);

  const remaining = DAILY_LIMIT - (currentCount + 1);
  return NextResponse.json({ imageUrl: publicUrl, remaining });
}
