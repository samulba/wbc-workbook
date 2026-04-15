"use client";

import { cn } from "@/lib/utils";
import { INSPIRATION, FALLBACK_INSPIRATION } from "../inspirationConfig";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import { ImageIcon } from "lucide-react";

interface Props {
  data: Module1Data;
}

const KEYWORD_COLORS: Record<string, string> = {
  mint:      "bg-mint/20 text-forest border-mint/30",
  "blau-grau":"bg-[#e9eff2] text-[#3d5a68] border-[#c0d0d8]/40",
  terracotta:"bg-terracotta/10 text-terracotta border-terracotta/20",
  sand:      "bg-sand/25 text-[#8a6030] border-sand/40",
  forest:    "bg-forest/10 text-forest border-forest/20",
};

const CARD_COLORS: Record<string, string> = {
  mint:      "bg-mint/8 border-mint/25",
  "blau-grau":"bg-[#eef2f4] border-[#c8d8de]/40",
  terracotta:"bg-terracotta/6 border-terracotta/15",
  sand:      "bg-sand/15 border-sand/30",
  forest:    "bg-forest/6 border-forest/15",
};

export function Step07({ data }: Props) {
  const effect  = data.main_effect as RoomEffect | null;
  const content = effect ? INSPIRATION[effect] : FALLBACK_INSPIRATION;
  const effectMeta = effect ? EFFECTS.find((e) => e.value === effect) : null;

  const keywordClass = KEYWORD_COLORS[content.colorMood] ?? KEYWORD_COLORS.sand;
  const cardClass    = CARD_COLORS[content.colorMood]    ?? CARD_COLORS.sand;

  return (
    <div className="flex flex-col gap-8">

      {/* Effect label badge */}
      {effectMeta && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${CARD_COLORS[content.colorMood]} border flex items-center justify-center`}>
            <effectMeta.Icon className={`w-4 h-4 ${content.accentColor}`} strokeWidth={1.5} />
          </div>
          <span className={`text-sm font-sans font-medium ${content.accentColor}`}>
            {effectMeta.label}
          </span>
        </div>
      )}

      {/* Tagline + description */}
      <div className={`rounded-2xl border p-6 ${cardClass}`}>
        <p className={`font-headline text-xl mb-3 ${content.accentColor}`}>
          {content.tagline}
        </p>
        <p className="font-sans text-sm text-forest/75 leading-relaxed">
          {content.description}
        </p>
      </div>

      {/* Keywords */}
      <div className="flex flex-col gap-3">
        <h3 className="font-headline text-lg text-forest">Design-Merkmale</h3>
        <div className="flex flex-wrap gap-2">
          {content.keywords.map((kw) => (
            <span
              key={kw}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm font-sans font-medium",
                keywordClass
              )}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Design principles */}
      {content.principles.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-headline text-lg text-forest">Gestaltungsprinzipien</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.principles.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-sand/30 bg-white/50 p-4 flex gap-3"
              >
                <div className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center mt-0.5 ${cardClass}`}>
                  <Icon className={`w-4 h-4 ${content.accentColor}`} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-forest mb-1">{title}</p>
                  <p className="font-sans text-xs text-gray/60 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image placeholder */}
      <div className="flex flex-col gap-3">
        <h3 className="font-headline text-lg text-forest">Inspirationsbilder</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border-2 border-dashed border-sand/40 bg-sand/5 flex flex-col items-center justify-center gap-1.5"
            >
              <ImageIcon className="w-5 h-5 text-sand/50" strokeWidth={1.5} />
              <span className="text-[10px] font-sans text-gray/35 uppercase tracking-wider">
                Bild {i}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs font-sans text-gray/40 text-center">
          Inspirationsbilder werden in einer zukünftigen Version hinzugefügt
        </p>
      </div>

      {/* Transition hint */}
      <div className="flex items-center gap-3 text-sm text-gray/50 font-sans">
        <div className="h-px flex-1 bg-sand/30" />
        <span>Im nächsten Schritt fasst du alles zusammen</span>
        <div className="h-px flex-1 bg-sand/30" />
      </div>

    </div>
  );
}
