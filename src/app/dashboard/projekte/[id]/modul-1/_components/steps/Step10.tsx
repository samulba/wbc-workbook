"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data, CanvasItem } from "@/lib/types/module1";
import { MoodboardCanvas } from "../MoodboardCanvas";
import { Check, Copy, ExternalLink, Sparkles, Save } from "lucide-react";

interface Props {
  data: Module1Data;
  projectId: string;
  roomId: string;
  roomType: string;
  roomName: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const LIGHT_LABELS: Record<string, string> = {
  gemuetlicher_abend:  "Gemütlicher Abend",
  produktiver_morgen:  "Produktiver Morgen",
  romantisches_dinner: "Romantisches Dinner",
  fokus_arbeit:        "Fokus-Arbeit",
  warm_indirekt:       "Warm & indirekt",
  hell_klar:           "Hell & klar",
  beides_steuerbar:    "Beides – steuerbar",
};

function buildMoodboardPrompt(
  data: Module1Data,
  roomType: string,
  roomName: string
): string {
  const roomLabel       = ROOM_LABELS[roomType] ?? roomType;
  const effect          = EFFECTS.find((e) => e.value === data.main_effect);
  const effectLabel     = effect?.label ?? "–";
  const primaryColors   = (data.primary_colors  ?? []).filter(Boolean).join(", ") || "–";
  const secondaryColors = (data.secondary_colors ?? []).filter(Boolean).join(", ") || "–";
  const accentColor     = data.accent_color?.trim() || "–";
  const materials       = (data.materials ?? []).join(", ") || "–";
  const lightMood       = LIGHT_LABELS[data.light_mood ?? ""] ?? data.light_mood ?? "–";
  const specialElements = data.special_elements?.trim() || "–";

  return `Du bist Interior Designer und erstellst ein visuelles Moodboard.

Raum: ${roomLabel} (${roomName})
Atmosphäre: ${effectLabel}
Primärfarben: ${primaryColors}
Sekundärfarben: ${secondaryColors}
Akzentfarbe: ${accentColor}
Materialien: ${materials}
Licht: ${lightMood}
Besondere Elemente: ${specialElements}

Erstelle ein Moodboard mit:
• 1 großes Hauptbild der Raumstimmung
• 1 Reihe Farbkreise mit der Farbpalette
• 6 Inspirationsbilder für Möbel, Materialien, Licht und Deko`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function Step10({ data, projectId, roomId, roomType, roomName, onChange }: Props) {
  const [copied, setCopied]     = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "idle">("saved");
  const [activeTab, setTab]     = useState<"canvas" | "prompt">(
    data.moodboard_canvas && data.moodboard_canvas.length > 0 ? "canvas" : "canvas",
  );
  const canvasItems = data.moodboard_canvas ?? [];
  const [favoriteImages, setFavoriteImages] = useState<string[]>([]);

  // Load user's favorites + inspiration once
  useEffect(() => {
    fetch("/api/user/favorites-images")
      .then((r) => (r.ok ? r.json() : { images: [] }))
      .then((d) => setFavoriteImages(d.images ?? []))
      .catch(() => {});
  }, []);

  // Auto-generate prompt on first load
  useEffect(() => {
    if (!data.moodboard_prompt) {
      onChange({ moodboard_prompt: buildMoodboardPrompt(data, roomType, roomName) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prompt = data.moodboard_prompt || buildMoodboardPrompt(data, roomType, roomName);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Canvas persistence with debounce ───────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleCanvasChange = useCallback((items: CanvasItem[]) => {
    setSaveState("saving");
    onChange({ moodboard_canvas: items });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSaveState("saved"), 800);
  }, [onChange]);

  // ── File upload → reuses the existing moodboard bucket ─────
  const handleUpload = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("projectId", projectId);
    fd.append("roomId", roomId);
    const res = await fetch("/api/upload/moodboard", { method: "POST", body: fd });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url as string;
  }, [projectId, roomId]);

  return (
    <div className="flex flex-col gap-8">

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-sand/30">
        <button
          type="button"
          onClick={() => setTab("canvas")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "canvas"
              ? "border-forest text-forest"
              : "border-transparent text-gray/50 hover:text-forest/70",
          )}
        >
          Canvas
        </button>
        <button
          type="button"
          onClick={() => setTab("prompt")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "prompt"
              ? "border-forest text-forest"
              : "border-transparent text-gray/50 hover:text-forest/70",
          )}
        >
          KI-Prompt
        </button>

        <div className="flex-1" />

        {activeTab === "canvas" && (
          <div className="text-xs text-forest/50 flex items-center gap-1.5">
            {saveState === "saving"
              ? <><Save className="w-3 h-3 animate-pulse" /> Speichert …</>
              : <><Check className="w-3 h-3" /> Gespeichert</>}
          </div>
        )}
      </div>

      {activeTab === "canvas" ? (
        <>
          <div>
            <h3 className="font-headline text-xl text-forest mb-1">
              Dein Moodboard-Canvas
            </h3>
            <p className="text-sm text-gray/60 font-sans">
              Zieh Bilder herein, ordne sie frei an, füge Farben oder Notizen hinzu.
              Alles speichert automatisch.
            </p>
          </div>

          <MoodboardCanvas
            items={canvasItems}
            onChange={handleCanvasChange}
            onUpload={handleUpload}
            inspirationImages={favoriteImages}
          />
        </>
      ) : (
        <>
          {/* Header badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sand/20 border border-sand/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sand" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-sans text-forest/60">
              Automatisch generiert aus deinen Angaben
            </span>
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg text-forest">Dein Prompt</h3>
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-sans font-medium",
                  "px-3 py-1.5 rounded-lg border transition-all",
                  copied
                    ? "border-forest/30 bg-forest/8 text-forest"
                    : "border-sand/40 bg-cream text-forest/55 hover:border-forest/30 hover:text-forest",
                )}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Kopiert!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Prompt kopieren</>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-sand/40 bg-cream/50 overflow-hidden">
              <textarea
                className={cn(
                  "w-full min-h-[260px] p-4",
                  "font-mono text-xs text-forest/75 leading-relaxed",
                  "resize-y bg-transparent outline-none",
                )}
                value={prompt}
                onChange={(e) => onChange({ moodboard_prompt: e.target.value })}
                spellCheck={false}
              />
            </div>
            <p className="text-xs text-gray/40 font-sans">
              Du kannst den Prompt anpassen, bevor du ihn kopierst.
            </p>
          </div>

          {/* Tool links */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-headline text-base text-forest">Empfohlene Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "ChatGPT",    hint: "DALL·E Bildgenerierung", href: "https://chat.openai.com" },
                { label: "Midjourney", hint: "via Discord",            href: "https://midjourney.com" },
              ].map(({ label, hint, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-sand/35 bg-white/50 px-4 py-3 transition-all group hover:border-forest/25 hover:bg-forest/5"
                >
                  <div>
                    <p className="text-sm font-sans font-medium text-forest">{label}</p>
                    <p className="text-xs text-gray/45 font-sans">{hint}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray/30 group-hover:text-forest/40 transition-colors" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
