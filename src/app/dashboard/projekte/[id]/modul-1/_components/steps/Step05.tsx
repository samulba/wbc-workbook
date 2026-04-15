"use client";

import { Lightbulb } from "lucide-react";
import { COLOR_PALETTES, FALLBACK_PALETTES } from "../colorPalettes";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";

interface Props {
  data: Module1Data;
}

const COLOR_LAYERS = [
  {
    label: "Primärfarben",
    sublabel: "Basis – 60 %",
    desc: "Wände, Boden, große Flächen",
    flex: "flex-[6]",
    dot: "bg-forest",
  },
  {
    label: "Sekundärfarben",
    sublabel: "Verstärkung – 30 %",
    desc: "Möbel, Textilien, mittlere Elemente",
    flex: "flex-[3]",
    dot: "bg-mint",
  },
  {
    label: "Akzentfarbe",
    sublabel: "Energie – 10 %",
    desc: "Deko, Kissen, Lampen, kleine Details",
    flex: "flex-[1]",
    dot: "bg-terracotta",
  },
];

function PaletteCard({
  palette,
}: {
  palette: (typeof FALLBACK_PALETTES)[number];
}) {
  const allColors = [...palette.primary, ...palette.secondary, palette.accent];

  return (
    <div className="rounded-2xl border border-sand/30 bg-white/50 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-headline text-base text-forest">{palette.name}</p>
          <p className="text-xs text-gray/50 font-sans mt-0.5">{palette.description}</p>
        </div>
      </div>

      {/* Swatches + 60/30/10 bar */}
      <div className="flex gap-1.5 mb-3">
        {/* 60 – two primaries */}
        <div className="flex gap-1 flex-[6]">
          {palette.primary.map((c, i) => (
            <div
              key={i}
              className="h-10 flex-1 rounded-lg shadow-sm"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
        {/* 30 – two secondaries */}
        <div className="flex gap-1 flex-[3]">
          {palette.secondary.map((c, i) => (
            <div
              key={i}
              className="h-10 flex-1 rounded-lg shadow-sm"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
        {/* 10 – accent */}
        <div className="flex-[1]">
          <div
            className="h-10 w-full rounded-lg shadow-sm"
            style={{ backgroundColor: palette.accent }}
            title={palette.accent}
          />
        </div>
      </div>

      {/* Hex labels */}
      <div className="flex gap-1.5 text-[10px] font-mono text-gray/40">
        {allColors.map((c, i) => (
          <span key={i} className="flex-1 text-center truncate">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Step05({ data }: Props) {
  const effect = data.main_effect as RoomEffect | null;
  const palettes =
    effect && COLOR_PALETTES[effect] ? COLOR_PALETTES[effect] : FALLBACK_PALETTES;

  const effectLabels: Record<RoomEffect, string> = {
    ruhe_erholung:            "Ruhe & Erholung",
    fokus_konzentration:      "Fokus & Konzentration",
    energie_aktivitaet:       "Energie & Aktivität",
    kreativitaet_inspiration: "Kreativität & Inspiration",
    begegnung_austausch:      "Begegnung & Austausch",
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Intro */}
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-6">
        <p className="font-sans text-base text-forest/80 leading-relaxed">
          Farben wirken direkt auf Atmosphäre, Energie und das Raumgefühl. Nicht
          jede Farbe passt zu jeder Hauptwirkung. Wichtig ist nicht die einzelne
          Farbe, sondern die{" "}
          <span className="font-medium text-forest">Kombination</span>.
        </p>
      </div>

      {/* Color system */}
      <div className="flex flex-col gap-4">
        <h3 className="font-headline text-xl text-forest">Das Farbsystem</h3>

        {/* 60/30/10 visual bar */}
        <div className="flex gap-1.5 h-4 rounded-full overflow-hidden">
          <div className="flex-[6] bg-forest/70 rounded-l-full" />
          <div className="flex-[3] bg-mint/80" />
          <div className="flex-[1] bg-terracotta rounded-r-full" />
        </div>
        <div className="flex gap-1.5 text-[10px] font-sans text-gray/50">
          <span className="flex-[6] text-center">60 %</span>
          <span className="flex-[3] text-center">30 %</span>
          <span className="flex-[1] text-center">10 %</span>
        </div>

        {/* Layer rows */}
        <div className="flex flex-col gap-3">
          {COLOR_LAYERS.map((layer) => (
            <div
              key={layer.label}
              className="flex items-center gap-4 rounded-xl border border-sand/30 bg-white/40 px-4 py-3.5"
            >
              <div className={`w-3 h-10 rounded-full ${layer.dot} opacity-70`} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-sans font-medium text-sm text-forest">
                    {layer.label}
                  </span>
                  <span className="text-xs text-sand font-sans">{layer.sublabel}</span>
                </div>
                <span className="text-xs text-gray/55 font-sans">{layer.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-xl bg-sand/15 border border-sand/30 px-4 py-3.5">
        <Lightbulb className="w-4 h-4 text-sand shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-sm font-sans text-gray/60 leading-relaxed">
          <span className="font-medium text-forest/70">Farbprinzip:</span>{" "}
          Nutze max. 5–6 Farben insgesamt und halte das{" "}
          <span className="font-medium text-forest/70">60 / 30 / 10</span>-Verhältnis
          ein – so wirkt der Raum harmonisch und nicht überladen.
        </p>
      </div>

      {/* Palette examples */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-xl text-forest">
            Beispiel-Paletten
          </h3>
          {effect && (
            <span className="text-xs font-sans font-medium text-forest/60 bg-mint/20 px-2.5 py-1 rounded-full">
              passend zu: {effectLabels[effect]}
            </span>
          )}
        </div>
        <p className="text-sm text-gray/55 font-sans -mt-2">
          Diese Paletten passen zur gewählten Hauptwirkung. Im nächsten Schritt
          definierst du deine eigene.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {palettes.map((palette) => (
            <PaletteCard key={palette.name} palette={palette} />
          ))}
        </div>
      </div>

      {/* Forward hint */}
      <div className="flex items-center gap-3 text-sm text-gray/50 font-sans">
        <div className="h-px flex-1 bg-sand/30" />
        <span>Im nächsten Schritt definierst du deine eigene Farbwelt</span>
        <div className="h-px flex-1 bg-sand/30" />
      </div>

    </div>
  );
}
