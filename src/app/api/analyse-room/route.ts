import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { gpt4oCostMicros } from "@/lib/ai/pricing";

const DAILY_LIMIT = 3;

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const EFFECT_LABELS: Record<string, string> = {
  ruhe_erholung:            "Ruhe & Erholung",
  fokus_konzentration:      "Fokus & Konzentration",
  energie_aktivitaet:       "Energie & Aktivität",
  kreativitaet_inspiration: "Kreativität & Inspiration",
  begegnung_austausch:      "Begegnung & Austausch",
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AllowedMime = typeof ALLOWED_MIME[number];

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let body: { imageBase64: string; mimeType: string; roomType: string; mainEffect?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { imageBase64, mimeType, roomType, mainEffect } = body;
  if (!imageBase64 || !mimeType || !roomType) {
    return NextResponse.json({ error: "Fehlende Parameter." }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(mimeType as AllowedMime)) {
    return NextResponse.json({ error: "Ungültiges Bildformat." }, { status: 400 });
  }

  // ── 3. Rate limit ─────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_analysis_count, analysis_reset_date")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const resetDate = profile?.analysis_reset_date;
  const isNewDay  = !resetDate || resetDate !== today;
  const currentCount = isNewDay ? 0 : (profile?.daily_analysis_count ?? 0);

  if (currentCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Du hast dein Tageslimit von ${DAILY_LIMIT} Analysen erreicht. Morgen geht es weiter!`, rateLimited: true },
      { status: 429 }
    );
  }

  // Increment counter before calling the API (prevents abuse from slow requests)
  await supabase
    .from("profiles")
    .update({
      daily_analysis_count: currentCount + 1,
      analysis_reset_date: today,
    })
    .eq("id", user.id);

  // ── 4. OpenAI Vision call (GPT-4o) ────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await supabase.from("profiles").update({ daily_analysis_count: currentCount }).eq("id", user.id);
    return NextResponse.json({ error: "KI-Analyse nicht konfiguriert." }, { status: 500 });
  }

  const client = new OpenAI({ apiKey });
  const roomLabel   = ROOM_LABELS[roomType] ?? roomType;
  const effectLabel = mainEffect ? (EFFECT_LABELS[mainEffect] ?? mainEffect) : "noch nicht festgelegt";

  const prompt = `Du bist ein erfahrener Raumgestalter und Innenarchitekt. Analysiere dieses Raumfoto.
Raumtyp: ${roomLabel}
Gewünschte Wirkung: ${effectLabel}

Gib eine strukturierte Analyse in genau diesem Format:

## Stärken des Raums
[2-3 positive Aspekte, die bereits gut funktionieren]

## Verbesserungspotenzial
[2-3 konkrete Bereiche, die optimiert werden könnten]

## Konkrete Empfehlungen
[3-4 umsetzbare Tipps, die speziell zur gewünschten Wirkung "${effectLabel}" passen]

## Farbempfehlung
[Welche Farben würden den Raum verbessern und wie einsetzen]

## Material- & Möbelvorschläge
[2-3 konkrete Vorschläge für Materialien oder Möbel]

Antworte auf Deutsch. Sei motivierend, konkret und praxisnah. Vermeide allgemeine Floskeln.`;

  let analysisText: string;
  let inputTokens  = 0;
  let outputTokens = 0;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Leere Antwort von OpenAI");
    analysisText = content;
    inputTokens  = response.usage?.prompt_tokens     ?? 0;
    outputTokens = response.usage?.completion_tokens ?? 0;
  } catch (err) {
    await supabase.from("profiles").update({ daily_analysis_count: currentCount }).eq("id", user.id);
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "Analyse fehlgeschlagen. Bitte erneut versuchen." }, { status: 500 });
  }

  // ── 5. Log usage (fire-and-forget; must not block response) ────────────────
  const costMicros = gpt4oCostMicros(inputTokens, outputTokens);
  createAdminClient()
    .from("ai_usage")
    .insert({
      user_id:       user.id,
      endpoint:      "analyse-room",
      model:         "gpt-4o",
      input_tokens:  inputTokens,
      output_tokens: outputTokens,
      cost_micros:   costMicros,
      metadata:      { roomType, mainEffect },
    })
    .then(({ error }) => { if (error) console.error("ai_usage insert (analyse):", error); });

  const remaining = DAILY_LIMIT - (currentCount + 1);
  return NextResponse.json({ analysis: analysisText, remaining });
}
