"use client";

import { Lamp, ExternalLink, Sparkles } from "lucide-react";
import type { Module3Data } from "@/lib/types/module3";

// Curated lamp categories per preset — simple links for now.
// Full affiliate integration lands when Module-2 product swipe deck goes live.

const LAMP_CATEGORIES = [
  {
    title: "Warmweiße Stehleuchten",
    desc:  "Für gemütliche Abende – 2.700 K, dimmbar.",
  },
  {
    title: "Tageslicht-Arbeitsleuchten",
    desc:  "Kühles Fokus-Licht für den Schreibtisch – ab 4.000 K.",
  },
  {
    title: "Dimmbare LED-Strips",
    desc:  "Indirektes Akzentlicht für Regale und Nischen.",
  },
  {
    title: "Tischlampen mit Textilschirm",
    desc:  "Weiche, streuende Lichtquelle für Sofa & Nachttisch.",
  },
] as const;

interface Props {
  data:     Module3Data;
  roomType: string;
}

export function Step06({ data, roomType }: Props) {
  const preset = data.preset;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lamp className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Leuchten zu deinem Konzept</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Basierend auf deinem Preset{preset ? ` "${preset}"` : ""} und deinem Raum-Typ
          ({roomType || "–"}) schlagen wir hier passende Leuchten-Kategorien vor.
          Die vollständige Produkt-Integration folgt in Modul 2.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {LAMP_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sand shrink-0" strokeWidth={1.5} />
              <h4 className="text-sm font-sans font-semibold text-forest leading-tight">
                {cat.title}
              </h4>
            </div>
            <p className="text-xs text-gray/55 font-sans leading-relaxed">{cat.desc}</p>
          </div>
        ))}
      </div>

      <a
        href="/dashboard/shopping"
        className="inline-flex items-center gap-1.5 self-start text-xs font-sans font-medium text-forest/70 hover:text-forest transition-colors"
      >
        Mehr Produkt-Empfehlungen im Shopping-Bereich
        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
      </a>
    </div>
  );
}
