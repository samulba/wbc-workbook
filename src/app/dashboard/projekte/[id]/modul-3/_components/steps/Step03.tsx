"use client";

import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module3Data, WindowOrientation } from "@/lib/types/module3";

const ORIENTATIONS: { value: WindowOrientation; label: string; desc: string }[] = [
  { value: "N",  label: "Nord",        desc: "Gleichmäßig, kühl, wenig direktes Sonnenlicht" },
  { value: "NO", label: "Nordost",     desc: "Morgensonne, kühl ab Mittag" },
  { value: "O",  label: "Ost",         desc: "Kräftige Morgensonne" },
  { value: "SO", label: "Südost",      desc: "Morgen-/Vormittagssonne" },
  { value: "S",  label: "Süd",         desc: "Warmes Licht den ganzen Tag" },
  { value: "SW", label: "Südwest",     desc: "Nachmittag- und Abendsonne" },
  { value: "W",  label: "West",        desc: "Warme Abendsonne" },
  { value: "NW", label: "Nordwest",    desc: "Sanfte Abendsonne" },
];

const USAGES = [
  { value: "morgen", label: "Morgens",    desc: "Aufwachen · Frühstück · Routinen" },
  { value: "tag",    label: "Tagsüber",   desc: "Arbeit · Haushalt · Pausen"        },
  { value: "abend",  label: "Abends",     desc: "Essen · Lesen · Entspannen"        },
  { value: "nacht",  label: "Nachts",     desc: "Schlafen · Wachphasen"             },
] as const;

interface Props {
  data:     Module3Data;
  onChange: (patch: Partial<Module3Data>) => void;
}

export function Step03({ data, onChange }: Props) {
  const orientation = data.window_orientation;
  const usage       = data.daytime_usage ?? [];

  function toggleUsage(v: string) {
    onChange({
      daytime_usage: usage.includes(v) ? usage.filter((u) => u !== v) : [...usage, v],
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Fenster-Orientierung */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Wo liegen deine Fenster?</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans">
          Die Himmelsrichtung bestimmt, wann und wie warm Tageslicht einfällt.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ORIENTATIONS.map(({ value, label, desc }) => {
            const active = orientation === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ window_orientation: active ? null : value })}
                className={cn(
                  "rounded-xl border text-left px-3.5 py-3 transition-all active:scale-[0.97]",
                  active
                    ? "border-forest bg-forest/5 ring-2 ring-mint/30"
                    : "border-sand/40 bg-white hover:border-forest/30 hover:bg-mint/5",
                )}
              >
                <p className={cn("text-sm font-semibold leading-tight", active ? "text-forest" : "text-forest/70")}>
                  {label}
                </p>
                <p className="text-[11px] text-gray/50 leading-snug mt-0.5">{desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tageszeit-Nutzung */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline text-lg text-forest">Wann nutzt du den Raum?</h3>
        <p className="text-sm text-gray/60 font-sans">
          Mehrfachauswahl – bestimmt, welche Lichtszenen wir später für dich planen.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {USAGES.map(({ value, label, desc }) => {
            const active = usage.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleUsage(value)}
                className={cn(
                  "rounded-xl border text-left px-3.5 py-3 transition-all active:scale-[0.97]",
                  active
                    ? "border-forest bg-forest/5 ring-2 ring-mint/30"
                    : "border-sand/40 bg-white hover:border-forest/30 hover:bg-mint/5",
                )}
              >
                <p className={cn("text-sm font-semibold leading-tight", active ? "text-forest" : "text-forest/70")}>
                  {label}
                </p>
                <p className="text-[11px] text-gray/50 leading-snug mt-0.5">{desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
