"use client";

import { Hand, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module4Data } from "@/lib/types/module4";

const MATERIALS = [
  { value: "leinen",     label: "Leinen",         desc: "Natürlich, leicht knittrig, atmungsaktiv" },
  { value: "wolle",      label: "Wolle",          desc: "Warm, strukturiert, schallschluckend" },
  { value: "baumwolle",  label: "Baumwolle",      desc: "Weich, alltagstauglich, pflegeleicht" },
  { value: "samt",       label: "Samt",           desc: "Luxuriös, schwer, visuelle Tiefe" },
  { value: "leder",      label: "Leder",          desc: "Robust, patina, warm" },
  { value: "holz_roh",   label: "Rohes Holz",     desc: "Haptisch lebendig, natürliche Maserung" },
  { value: "holz_glatt", label: "Glattes Holz",   desc: "Clean, lackiert oder geölt" },
  { value: "stein",      label: "Stein",          desc: "Kühl, erdend, elegant" },
  { value: "keramik",    label: "Keramik",        desc: "Handwerklich, matt oder glasiert" },
  { value: "metall_matt",label: "Mattes Metall",  desc: "Messing, schwarz, Edelstahl gebürstet" },
  { value: "glas",       label: "Glas",           desc: "Transparenz, Spiegelung, leicht" },
  { value: "rattan",     label: "Rattan / Bast",  desc: "Warme Struktur, natürlich geflochten" },
];

interface Props {
  data:     Module4Data;
  onChange: (patch: Partial<Module4Data>) => void;
}

export function Step04({ data, onChange }: Props) {
  const preferred = data.preferred_materials ?? [];
  const rejected  = data.rejected_materials  ?? [];

  function toggle(value: string, to: "prefer" | "reject") {
    const inPref = preferred.includes(value);
    const inRej  = rejected.includes(value);

    if (to === "prefer") {
      if (inPref) {
        onChange({ preferred_materials: preferred.filter((v) => v !== value) });
      } else {
        onChange({
          preferred_materials: [...preferred, value],
          rejected_materials:  inRej ? rejected.filter((v) => v !== value) : rejected,
        });
      }
    } else {
      if (inRej) {
        onChange({ rejected_materials: rejected.filter((v) => v !== value) });
      } else {
        onChange({
          rejected_materials:  [...rejected, value],
          preferred_materials: inPref ? preferred.filter((v) => v !== value) : preferred,
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Hand className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Was möchtest du berühren?</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Markiere jedes Material mit <ThumbsUp className="inline w-3 h-3" /> oder <ThumbsDown className="inline w-3 h-3" />.
          Die bevorzugten Materialien helfen später beim Möbel-Einkauf.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {MATERIALS.map(({ value, label, desc }) => {
          const isPref = preferred.includes(value);
          const isRej  = rejected.includes(value);
          return (
            <div
              key={value}
              className={cn(
                "rounded-xl border p-3.5 flex items-start gap-3 transition-all",
                isPref ? "border-forest bg-forest/5" :
                isRej  ? "border-red-200 bg-red-50/60" :
                         "border-sand/40 bg-white",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold leading-tight",
                  isPref ? "text-forest" : isRej ? "text-red-600/70" : "text-forest/70")}>
                  {label}
                </p>
                <p className="text-[11px] text-gray/50 leading-snug mt-0.5">{desc}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggle(value, "reject")}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition",
                    isRej ? "bg-red-100 border-red-300 text-red-600" : "border-sand/30 text-gray-400 hover:text-red-500 hover:border-red-300",
                  )}
                  aria-label="Nicht mein Ding"
                >
                  <ThumbsDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(value, "prefer")}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition",
                    isPref ? "bg-forest/10 border-forest/40 text-forest" : "border-sand/30 text-gray-400 hover:text-forest hover:border-forest/30",
                  )}
                  aria-label="Gefällt mir"
                >
                  <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray/45 font-sans">
        {preferred.length} bevorzugt · {rejected.length} abgelehnt
      </p>
    </div>
  );
}
