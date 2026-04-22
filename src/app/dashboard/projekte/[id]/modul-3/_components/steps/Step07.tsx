"use client";

import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import type { Module3Data } from "@/lib/types/module3";

const TIMELINE: { key: keyof NonNullable<Module3Data["scenarios"]>; label: string; desc: string; Icon: React.ElementType }[] = [
  { key: "morgen", label: "Morgen",    desc: "6–10 Uhr · Aufwachen, Start in den Tag",  Icon: Sunrise },
  { key: "tag",    label: "Tag",       desc: "10–17 Uhr · Arbeiten, Alltag",             Icon: Sun     },
  { key: "abend",  label: "Abend",     desc: "17–22 Uhr · Entspannen, Essen",            Icon: Sunset  },
  { key: "nacht",  label: "Nacht",     desc: "22+ Uhr · Herunterfahren, Schlafen",       Icon: Moon    },
];

interface Props {
  data:     Module3Data;
  roomName: string;
}

export function Step07({ data, roomName }: Props) {
  const scenarios = data.scenarios ?? {};
  const fixtures  = data.current_fixtures ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <h3 className="font-headline text-lg text-forest mb-1">
          Lichtszenen für {roomName}
        </h3>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Ein Überblick deiner Tageszeiten und welche Leuchten zu welcher Zeit im Einsatz sind.
          Dieser Plan hilft dir später bei der Smart-Home-Programmierung.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {TIMELINE.map(({ key, label, desc, Icon }) => {
          const active = scenarios[key] ?? [];
          return (
            <div key={key} className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-forest/70" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-forest leading-tight">{label}</p>
                  <p className="text-[11px] text-gray/50 font-sans">{desc}</p>
                </div>
              </div>

              {fixtures.length === 0 ? (
                <p className="text-xs text-gray/45 font-sans italic">
                  Keine Lichtquellen erfasst – gehe zurück zu Schritt 1.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {fixtures.map((f) => (
                    <span
                      key={f.id}
                      className={
                        "text-[11px] font-sans px-2.5 py-1 rounded-full border " +
                        (active.includes(f.id)
                          ? "bg-forest/10 border-forest/30 text-forest"
                          : "bg-cream border-sand/30 text-gray/60")
                      }
                    >
                      {f.name || "Unbenannt"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray/45 font-sans italic">
        Tipp: Interactive Szenen-Zuordnung (Drag &amp; Drop) folgt in einem nächsten Update.
      </p>
    </div>
  );
}
