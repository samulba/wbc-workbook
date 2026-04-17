"use client";

import { cn } from "@/lib/utils";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import { Pencil, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  data:      Module1Data;
  projectId: string;
  roomId:    string;
}

// Map material values → a small CSS texture chip (mirrors Step06 palette)
const MATERIAL_BG: Record<string, string> = {
  holz_hell:  "linear-gradient(120deg, #e9d2a9, #c9a572)",
  holz_dunkel:"linear-gradient(120deg, #6b4b34, #402b18)",
  stein:      "linear-gradient(120deg, #a19c92, #5a564f)",
  marmor:     "linear-gradient(120deg, #f0ebe2, #c8c0b2)",
  kork:       "linear-gradient(120deg, #c8a070, #a2744a)",
  bambus:     "linear-gradient(120deg, #d2c294, #9e946d)",
  leinen:     "linear-gradient(135deg, #ede4d1, #c5b79a)",
  samt:       "linear-gradient(135deg, #7a4b5c, #3d1e2e)",
  wolle:      "linear-gradient(135deg, #cec2b2, #998b78)",
  baumwolle:  "linear-gradient(135deg, #f0ebe2, #d0c7b6)",
  jute:       "linear-gradient(135deg, #c9a46e, #8e693d)",
  glas:       "linear-gradient(135deg, rgba(183,210,220,0.85), rgba(155,185,200,0.85))",
  metall:     "linear-gradient(135deg, #9098a0, #4d535a)",
  beton:      "linear-gradient(135deg, #b9b6af, #676560)",
  leder:      "linear-gradient(135deg, #7a4a28, #422815)",
  rattan:     "linear-gradient(135deg, #d4b082, #9c7a4b)",
  keramik:    "linear-gradient(135deg, #d2b69a, #98805f)",
  papier:     "linear-gradient(135deg, #f4ead9, #d1bfa1)",
};

const LIGHT_PRESET_LABELS: Record<string, { label: string; emoji: string }> = {
  gemuetlicher_abend:  { label: "Gemütlicher Abend",  emoji: "🔥" },
  produktiver_morgen:  { label: "Produktiver Morgen", emoji: "🌅" },
  romantisches_dinner: { label: "Romantisches Dinner",emoji: "🕯" },
  fokus_arbeit:        { label: "Fokus-Arbeit",       emoji: "💡" },
  warm_indirekt:       { label: "Warm & indirekt",    emoji: "🔥" },
  hell_klar:           { label: "Hell & klar",        emoji: "☀️" },
  beides_steuerbar:    { label: "Flexibel steuerbar", emoji: "🎛" },
};

export function Step09({ data, projectId, roomId }: Props) {
  const effect     = data.main_effect as RoomEffect | null;
  const effectMeta = effect ? EFFECTS.find((e) => e.value === effect) : null;

  const allColors = [
    ...(data.primary_colors   ?? []),
    ...(data.secondary_colors ?? []),
    data.accent_color,
  ].filter((c): c is string => !!c && c.length > 0);

  const materials = data.materials ?? [];
  const specialTags = data.special_tags ?? [];
  const light       = data.light_mood
    ? LIGHT_PRESET_LABELS[data.light_mood] ?? { label: data.light_mood, emoji: "💡" }
    : null;
  const warmth = data.light_warmth;
  const brightness = data.light_brightness;

  // Animated reveal — each row fades in sequentially
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= 6) clearInterval(t);
    }, 250);
    return () => clearInterval(t);
  }, []);

  const editBase = `/dashboard/projekte/${projectId}/raum/${roomId}/modul-1`;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-xs font-sans uppercase tracking-widest text-sand mb-2">
          Dein Konzept auf einen Blick
        </p>
        <h2 className="font-headline text-2xl sm:text-3xl text-forest">
          Sieht das richtig aus?
        </h2>
        <p className="text-sm text-gray/60 font-sans mt-1">
          Jeder Bereich ist bearbeitbar — klicke auf „Ändern“ um zurückzuspringen.
        </p>
      </div>

      {/* ── Mood Card ───────────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-cream to-white border border-forest/10 shadow-lg">

        {/* Hero effect */}
        {effectMeta && (
          <RecapRow index={0} revealed={revealed} edit={`${editBase}?step=4&edit=true`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                   style={{ background: effectMeta.tint }}>
                {effectMeta.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-forest/50 mb-0.5">Hauptwirkung</p>
                <p className="font-headline text-xl text-forest leading-tight">{effectMeta.label}</p>
                <p className="text-xs text-gray/50 mt-0.5 truncate">{effectMeta.keywords}</p>
              </div>
            </div>
          </RecapRow>
        )}

        {/* Palette stripe */}
        {allColors.length > 0 && (
          <RecapRow index={1} revealed={revealed} edit={`${editBase}?step=6&edit=true`}>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-forest/50 mb-2">Farbpalette</p>
              <div className="flex h-10 rounded-xl overflow-hidden shadow-inner">
                {allColors.map((c, i) => (
                  <div
                    key={`${c}-${i}`}
                    className="flex-1 transition-all"
                    style={{
                      background:    c,
                      animation:     `wbc-pal-in 600ms ease-out forwards ${i * 80}ms`,
                      opacity:       0,
                      transform:     "scaleY(0.6)",
                      transformOrigin:"center",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2 text-[10px] font-mono text-gray/50 flex-wrap">
                {allColors.map((c, i) => (
                  <span key={i} className="uppercase">{c}</span>
                ))}
              </div>
            </div>
          </RecapRow>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <RecapRow index={2} revealed={revealed} edit={`${editBase}?step=6&edit=true`}>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-forest/50 mb-2">Materialien</p>
              <div className="flex flex-wrap gap-2">
                {materials.map((m, i) => (
                  <div key={m} className="flex items-center gap-2" style={{
                    animation: `wbc-row-in 400ms ease-out forwards ${i * 60}ms`,
                    opacity: 0,
                  }}>
                    <div
                      className="w-7 h-7 rounded-full border border-forest/10 shadow-sm"
                      style={{ background: MATERIAL_BG[m] ?? "#c9a572" }}
                    />
                    <span className="text-xs font-sans font-medium text-forest/80 capitalize">
                      {m.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </RecapRow>
        )}

        {/* Light */}
        {(light || warmth !== null || brightness !== null) && (
          <RecapRow index={3} revealed={revealed} edit={`${editBase}?step=8&edit=true`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                   style={{
                     background: lightBgForValues(warmth ?? 50, brightness ?? 60),
                   }}>
                {light?.emoji ?? "💡"}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-forest/50 mb-0.5">Licht</p>
                <p className="font-headline text-lg text-forest leading-tight">
                  {light?.label ?? "Individuelle Einstellung"}
                </p>
                {(warmth !== null || brightness !== null) && (
                  <p className="text-[11px] text-gray/50 mt-0.5">
                    Wärme {warmth ?? 50} · Helligkeit {brightness ?? 60}
                  </p>
                )}
              </div>
            </div>
          </RecapRow>
        )}

        {/* Special elements */}
        {(specialTags.length > 0 || data.special_elements) && (
          <RecapRow index={4} revealed={revealed} edit={`${editBase}?step=8&edit=true`}>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-forest/50 mb-2">Besondere Elemente</p>
              {specialTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {specialTags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-forest/10 text-forest/80 font-medium">
                      {t.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
              {data.special_elements && (
                <p className="text-xs text-gray/60 italic whitespace-pre-wrap leading-relaxed">
                  {data.special_elements}
                </p>
              )}
            </div>
          </RecapRow>
        )}

        {/* Change reason — footer quote */}
        {data.change_reason && (
          <div
            className="px-5 py-4 bg-forest/5 border-t border-forest/10 transition-all"
            style={{
              opacity:    revealed >= 5 ? 1 : 0,
              transform:  revealed >= 5 ? "translateY(0)" : "translateY(8px)",
              transitionDuration: "500ms",
            }}
          >
            <p className="text-[10px] uppercase tracking-widest text-forest/50 mb-1">
              Ich verändere diesen Raum, weil …
            </p>
            <p className="text-sm italic text-forest/80 leading-relaxed">
              „{data.change_reason}“
            </p>
          </div>
        )}
      </div>

      {/* Confirmation banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-mint/40 bg-mint/10 px-5 py-4">
        <CheckCircle2 className="w-5 h-5 text-forest shrink-0" strokeWidth={1.5} />
        <p className="text-sm text-forest/80">
          Passt alles? Dann geht&apos;s weiter zum Moodboard-Canvas, wo du dein Konzept visuell zusammenstellst.
        </p>
      </div>

      <style jsx>{`
        @keyframes wbc-pal-in {
          from { opacity: 0; transform: scaleY(0.6); }
          to   { opacity: 1; transform: scaleY(1); }
        }
        @keyframes wbc-row-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function RecapRow({
  index, revealed, edit, children,
}: {
  index: number;
  revealed: number;
  edit:  string;
  children: React.ReactNode;
}) {
  const isRevealed = revealed >= index;
  return (
    <div
      className={cn(
        "relative px-5 py-4 border-b border-sand/20 last:border-0 transition-all",
      )}
      style={{
        opacity:   isRevealed ? 1 : 0,
        transform: isRevealed ? "translateY(0)" : "translateY(8px)",
        transitionDuration: "500ms",
      }}
    >
      {children}
      <a
        href={edit}
        className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] text-forest/50 hover:text-forest"
      >
        <Pencil className="w-3 h-3" strokeWidth={1.5} />
        Ändern
      </a>
    </div>
  );
}

function lightBgForValues(warmth: number, brightness: number): string {
  const rgb =
    warmth < 50
      ? mix([166,202,222], [245,240,225], warmth / 50)
      : mix([245,240,225], [255,200,140], (warmth - 50) / 50);
  const alpha = 0.45 + (brightness / 100) * 0.45;
  return `linear-gradient(135deg, rgba(${rgb.join(",")},${alpha}), rgba(${rgb.map((v) => Math.max(v - 30, 0)).join(",")},${alpha}))`;
}
function mix(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}
