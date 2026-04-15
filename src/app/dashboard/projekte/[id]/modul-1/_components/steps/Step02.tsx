"use client";

import { Textarea } from "@/components/ui/Textarea";
import type { Module1Data } from "@/lib/types/module1";

interface Props {
  data: Module1Data;
  onChange: (patch: Partial<Module1Data>) => void;
}

export function Step02({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-10">

      {/* Current pain */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Was fühlt sich aktuell nicht stimmig an?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Beschreibe, was dich in diesem Raum stört, fehlt oder belastet.
          </p>
        </div>
        <Textarea
          placeholder="Es fühlt sich beengt an, das Licht ist zu hart, die Farben passen nicht zu mir …"
          value={data.current_issues ?? ""}
          onChange={(e) => onChange({ current_issues: e.target.value })}
          rows={4}
        />
      </div>

      {/* More / less */}
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Was soll sich verändern?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Beschreibe das Gleichgewicht zwischen dem, was du dir wünschst und was du loslassen möchtest.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* More of */}
          <div className="rounded-2xl border border-mint/40 bg-mint/5 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-mint flex items-center justify-center text-forest text-xs font-bold leading-none">
                +
              </span>
              <span className="font-headline text-lg text-forest">Mehr von …</span>
            </div>
            <Textarea
              placeholder="Natürlichkeit, Ruhe, warme Töne, Ordnung …"
              value={data.more_of ?? ""}
              onChange={(e) => onChange({ more_of: e.target.value })}
              rows={4}
              className="bg-cream/60"
            />
          </div>

          {/* Less of */}
          <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-terracotta/60 flex items-center justify-center text-cream text-xs font-bold leading-none">
                −
              </span>
              <span className="font-headline text-lg text-forest">Weniger von …</span>
            </div>
            <Textarea
              placeholder="Chaos, grelles Licht, kalte Materialien …"
              value={data.less_of ?? ""}
              onChange={(e) => onChange({ less_of: e.target.value })}
              rows={4}
              className="bg-cream/60"
            />
          </div>
        </div>
      </div>

      {/* Change reason */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Ich verändere diesen Raum, weil …
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Formuliere deinen Kern-Grund in einem einzigen Satz. Das ist dein Anker für das gesamte Projekt.
          </p>
        </div>
        <div className="relative">
          <Textarea
            placeholder="… ich mir einen Rückzugsort schaffen möchte, der wirklich zu mir passt."
            value={data.change_reason ?? ""}
            onChange={(e) => onChange({ change_reason: e.target.value })}
            rows={2}
            className="pr-4 font-sans italic text-forest/80"
          />
          {/* Decorative quote mark */}
          <span className="absolute -top-3 -left-1 font-headline text-5xl text-mint/40 leading-none select-none pointer-events-none">
            &ldquo;
          </span>
        </div>
      </div>

    </div>
  );
}
