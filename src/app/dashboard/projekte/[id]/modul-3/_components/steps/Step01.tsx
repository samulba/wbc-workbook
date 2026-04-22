"use client";

import { Lightbulb, Plus, Trash2, Lamp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Module3Data, LightFixture } from "@/lib/types/module3";

const KIND_LABELS: Record<LightFixture["kind"], string> = {
  deckenlicht: "Deckenlicht",
  stehlampe:   "Stehlampe",
  tischlampe:  "Tischlampe",
  wandlampe:   "Wandlampe",
  led_strip:   "LED-Strip",
  kerze:       "Kerze / Flamme",
  sonstige:    "Sonstige",
};

const KIND_ORDER: LightFixture["kind"][] = [
  "deckenlicht", "stehlampe", "tischlampe", "wandlampe", "led_strip", "kerze", "sonstige",
];

interface Props {
  data:     Module3Data;
  onChange: (patch: Partial<Module3Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step01({ data, onChange }: Props) {
  const fixtures = data.current_fixtures ?? [];

  function addFixture(kind: LightFixture["kind"]) {
    onChange({
      current_fixtures: [
        ...fixtures,
        { id: uid(), kind, name: "", notes: "" },
      ],
    });
  }

  function updateFixture(id: string, patch: Partial<LightFixture>) {
    onChange({
      current_fixtures: fixtures.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function removeFixture(id: string) {
    onChange({ current_fixtures: fixtures.filter((f) => f.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Bestandsaufnahme</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Welche Lichtquellen hast du aktuell im Raum? Eine ehrliche Analyse ist
          die Basis für dein neues Lichtkonzept – je konkreter, desto besser.
        </p>
      </div>

      {/* Existing fixtures */}
      <div className="flex flex-col gap-3">
        {fixtures.length === 0 && (
          <div className="rounded-xl border border-dashed border-sand/50 px-5 py-6 text-center">
            <Lamp className="w-5 h-5 text-sand mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-gray/50 font-sans">
              Noch keine Lichtquelle erfasst – wähle unten eine Kategorie.
            </p>
          </div>
        )}

        {fixtures.map((f) => (
          <div key={f.id} className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-sans uppercase tracking-widest text-sand">
                {KIND_LABELS[f.kind]}
              </span>
              <button
                type="button"
                onClick={() => removeFixture(f.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Lichtquelle entfernen"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <Input
              placeholder="z. B. Deckenspot über der Couch"
              value={f.name}
              onChange={(e) => updateFixture(f.id, { name: e.target.value })}
            />
            <Input
              placeholder="Notiz — Stimmung, Farbe, Problem …"
              value={f.notes}
              onChange={(e) => updateFixture(f.id, { notes: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Add row */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
          Lichtquelle hinzufügen
        </p>
        <div className="flex flex-wrap gap-1.5">
          {KIND_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => addFixture(kind)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sand/40 bg-cream text-xs font-sans text-forest/70 hover:border-forest/40 hover:bg-mint/10 transition-colors"
            >
              <Plus className="w-3 h-3" strokeWidth={1.5} />
              {KIND_LABELS[kind]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
