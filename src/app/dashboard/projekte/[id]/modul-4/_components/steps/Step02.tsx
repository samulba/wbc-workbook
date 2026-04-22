"use client";

import { Ear, Volume1, Volume2, Volume } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module4Data, ReverbLevel } from "@/lib/types/module4";

const LEVELS: { value: ReverbLevel; label: string; desc: string; Icon: LucideIcon }[] = [
  { value: "niedrig", label: "Wenig Hall", desc: "Textilien, Teppich, Vorhänge absorbieren gut.", Icon: Volume  },
  { value: "mittel",  label: "Etwas Hall", desc: "Der Raum klingt normal – leichte Verbesserung möglich.", Icon: Volume1 },
  { value: "hoch",    label: "Stark hallig", desc: "Harte Oberflächen, kaum Textilien. Gespräche schwingen nach.", Icon: Volume2 },
];

const MEASURES = [
  { value: "teppich",     label: "Teppich / Läufer",    desc: "Absorbiert am effektivsten" },
  { value: "vorhaenge",   label: "Schwere Vorhänge",    desc: "Dämpfen Fenster-Reflexionen" },
  { value: "textilsofa",  label: "Textil-Sofa",          desc: "Große, weiche Flächen" },
  { value: "bilder",      label: "Bilder / Leinwand",   desc: "Brechen Schallwellen an Wänden" },
  { value: "buecherregal",label: "Bücherregal",         desc: "Überraschend wirksamer Absorber" },
  { value: "akustikpanel",label: "Akustikpaneele",      desc: "Gezielte Dämmung für Audio-Räume" },
  { value: "pflanzen",    label: "Große Zimmerpflanzen",desc: "Zerstreuen Schall, grüner Bonus" },
];

interface Props {
  data:     Module4Data;
  onChange: (patch: Partial<Module4Data>) => void;
}

export function Step02({ data, onChange }: Props) {
  const level    = data.reverb_level;
  const measures = data.acoustic_measures ?? [];

  function toggleMeasure(v: string) {
    onChange({
      acoustic_measures: measures.includes(v) ? measures.filter((m) => m !== v) : [...measures, v],
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Ear className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Wie klingt dein Raum?</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Klatsche einmal in die Hände. Hallt es lange nach? Dann absorbiert der Raum zu wenig Schall
          und wirkt anstrengender — selbst wenn du es bewusst nicht merkst.
        </p>
      </div>

      {/* Reverb level */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Einschätzung</p>
        <div className="grid sm:grid-cols-3 gap-2">
          {LEVELS.map(({ value, label, desc, Icon }) => {
            const active = level === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ reverb_level: active ? null : value })}
                className={cn(
                  "rounded-xl border p-3.5 text-left transition-all active:scale-[0.97]",
                  active ? "border-forest bg-forest/5 ring-2 ring-mint/30" : "border-sand/40 bg-white hover:border-forest/30 hover:bg-mint/5",
                )}
              >
                <Icon className={cn("w-4 h-4 mb-2", active ? "text-forest" : "text-forest/50")} strokeWidth={1.5} />
                <p className={cn("text-sm font-semibold leading-tight", active ? "text-forest" : "text-forest/70")}>{label}</p>
                <p className="text-[11px] text-gray/50 leading-snug mt-0.5">{desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Maßnahmen */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-sand font-sans">
          Maßnahmen gegen Hall (Mehrfachauswahl)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MEASURES.map(({ value, label, desc }) => {
            const active = measures.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleMeasure(value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all active:scale-[0.97]",
                  active ? "border-forest bg-forest/5 ring-2 ring-mint/30" : "border-sand/40 bg-white hover:border-forest/30 hover:bg-mint/5",
                )}
              >
                <p className={cn("text-sm font-semibold leading-tight", active ? "text-forest" : "text-forest/70")}>{label}</p>
                <p className="text-[11px] text-gray/50 leading-snug mt-0.5">{desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
