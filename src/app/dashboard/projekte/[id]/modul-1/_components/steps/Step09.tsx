"use client";

import { cn } from "@/lib/utils";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import { CheckCircle2, ImageIcon } from "lucide-react";

interface Props {
  data: Module1Data;
}

const GUIDE_STEPS = [
  "Dein Raum-Briefing ist ausgefüllt",
  "Wir generieren einen Moodboard-Prompt für dich",
  "Kopiere den Prompt",
  "Füge ihn in ChatGPT / Midjourney ein",
  "Lade dein generiertes Moodboard hoch",
];

export function Step09({ data }: Props) {
  const effect     = data.main_effect as RoomEffect | null;
  const effectMeta = effect ? EFFECTS.find((e) => e.value === effect) : null;

  const briefingDone =
    !!data.main_effect &&
    !!(data.primary_colors?.[0] || data.accent_color) &&
    (data.materials?.length ?? 0) > 0 &&
    !!data.light_mood;

  return (
    <div className="flex flex-col gap-8">

      {/* Intro card */}
      <div className="rounded-2xl bg-gradient-to-br from-forest/8 to-mint/10 border border-forest/15 p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <ImageIcon className="w-4 h-4 text-forest/50" strokeWidth={1.5} />
          <span className="text-xs font-sans uppercase tracking-[0.18em] text-forest/45">
            Was ist ein Moodboard?
          </span>
        </div>
        <p className="font-sans text-sm text-forest/80 leading-relaxed">
          Ein Moodboard macht deine Raumidee sichtbar. Es verbindet Farben, Materialien,
          Formen und Atmosphäre zu einer klaren visuellen Richtung – und hilft dir,
          deine Vorstellung zu kommunizieren und umzusetzen.
        </p>
      </div>

      {/* 5-step guide */}
      <div className="flex flex-col gap-3">
        <h3 className="font-headline text-lg text-forest">So geht es weiter</h3>
        <div className="flex flex-col gap-2">
          {GUIDE_STEPS.map((label, i) => {
            const isDone = i === 0 ? briefingDone : false;
            const isNext = i === 1;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl border px-4 py-3.5",
                  isDone
                    ? "border-forest/20 bg-forest/5"
                    : isNext
                    ? "border-sand/50 bg-cream"
                    : "border-sand/20 bg-white/30"
                )}
              >
                {isDone ? (
                  <CheckCircle2
                    className="w-5 h-5 text-forest/70 shrink-0"
                    strokeWidth={1.5}
                  />
                ) : (
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      "text-[11px] font-sans font-bold leading-none",
                      isNext ? "border-sand text-sand" : "border-sand/30 text-sand/30"
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span
                  className={cn(
                    "text-sm font-sans leading-snug",
                    isDone
                      ? "text-forest font-medium"
                      : isNext
                      ? "text-forest/70"
                      : "text-gray/40"
                  )}
                >
                  {label}
                  {i === 0 && !briefingDone && (
                    <span className="ml-2 text-xs text-sand/60">
                      (Schritte 4 – 8 ausfüllen)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current state peek */}
      {effectMeta && (
        <div className="rounded-xl border border-sand/30 bg-white/60 px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest/5 border border-forest/10 flex items-center justify-center shrink-0">
            <effectMeta.Icon className="w-4 h-4 text-forest/55" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-0.5">
              Deine Hauptwirkung
            </p>
            <p className="text-sm font-sans font-medium text-forest">{effectMeta.label}</p>
          </div>
          {/* Color dots preview */}
          <div className="flex gap-1 shrink-0">
            {[
              ...(data.primary_colors ?? []),
              ...(data.secondary_colors ?? []),
              data.accent_color,
            ]
              .filter(Boolean)
              .slice(0, 5)
              .map((c, idx) => (
                <span
                  key={idx}
                  className="w-5 h-5 rounded-full border border-sand/30 shrink-0"
                  style={{ backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : "#cba178" }}
                  title={c}
                />
              ))}
          </div>
        </div>
      )}

      {/* Transition hint */}
      <div className="flex items-center gap-3 text-sm text-gray/45 font-sans">
        <div className="h-px flex-1 bg-sand/25" />
        <span>Klicke auf &ldquo;Prompt generieren&rdquo;, um fortzufahren</span>
        <div className="h-px flex-1 bg-sand/25" />
      </div>

    </div>
  );
}
