"use client";

import { Flower, Plus, Trash2, Wind } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { Module4Data, PlantSuggestion, ScentMethod } from "@/lib/types/module4";

const METHODS: { value: ScentMethod; label: string; desc: string }[] = [
  { value: "diffuser",  label: "Ätherischer Diffuser", desc: "Sanft, dosierbar, ohne Rauch" },
  { value: "kerze",     label: "Duftkerze",             desc: "Ritualhaft, warm, flickernd" },
  { value: "pflanze",   label: "Duft-Pflanze",          desc: "Jasmin, Lavendel, Rosmarin …" },
  { value: "raumspray", label: "Raumspray",             desc: "Punktuell, schnell – nicht dauerhaft" },
  { value: "keine",     label: "Bewusst keine Düfte",   desc: "Frische Luft ist schon genug" },
];

const STARTER_PLANTS: { id: string; name: string; notes: string }[] = [
  { id: "starter-1", name: "Monstera",   notes: "Große, strukturierte Blätter" },
  { id: "starter-2", name: "Efeutute",   notes: "Hängend, luftreinigend" },
  { id: "starter-3", name: "Bogenhanf",  notes: "Pflegeleicht, auch nachts O₂" },
  { id: "starter-4", name: "Lavendel",   notes: "Duft, beruhigend" },
];

interface Props {
  data:     Module4Data;
  onChange: (patch: Partial<Module4Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step03({ data, onChange }: Props) {
  const method  = data.scent_method;
  const notes   = data.scent_notes   ?? "";
  const plants  = data.plant_suggestions ?? [];

  function addPlant(template?: typeof STARTER_PLANTS[number]) {
    const p: PlantSuggestion = template
      ? { id: uid(), name: template.name, notes: template.notes }
      : { id: uid(), name: "", notes: "" };
    onChange({ plant_suggestions: [...plants, p] });
  }

  function updatePlant(id: string, patch: Partial<PlantSuggestion>) {
    onChange({ plant_suggestions: plants.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }

  function removePlant(id: string) {
    onChange({ plant_suggestions: plants.filter((p) => p.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Wind className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Duft & Luftqualität</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Duft wirkt direkt auf die Stimmung – wähle einen Träger für deinen Raum und überlege, welche
          Pflanzen deinen Alltag bereichern könnten.
        </p>
      </div>

      {/* Method */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Duft-Träger</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {METHODS.map(({ value, label, desc }) => {
            const active = method === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ scent_method: active ? null : value })}
                className={cn(
                  "rounded-xl border p-3.5 text-left transition-all active:scale-[0.97]",
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

      {/* Notes */}
      <section className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Duft-Notizen</p>
        <Textarea
          placeholder="z. B. Lavendel zum Einschlafen, Bergamotte für den Fokus am Schreibtisch …"
          value={notes}
          onChange={(e) => onChange({ scent_notes: e.target.value })}
          rows={3}
        />
      </section>

      {/* Plants */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Flower className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h4 className="font-headline text-base text-forest">Pflanzen-Vorschläge</h4>
        </div>
        <p className="text-xs text-gray/55 font-sans">
          Starter-Ideen antippen oder eigene Pflanzen hinzufügen.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {STARTER_PLANTS.map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => addPlant(sp)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sand/40 bg-cream text-xs font-sans text-forest/70 hover:border-forest/40 hover:bg-mint/10 transition-colors"
            >
              <Plus className="w-3 h-3" strokeWidth={1.5} />
              {sp.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {plants.map((p) => (
            <div key={p.id} className="rounded-lg border border-sand/30 bg-white p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Pflanzenname"
                  value={p.name}
                  onChange={(e) => updatePlant(p.id, { name: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removePlant(p.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label="Entfernen"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <Input
                placeholder="Notiz"
                value={p.notes}
                onChange={(e) => updatePlant(p.id, { notes: e.target.value })}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => addPlant()}
            className="self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-forest/30 bg-white hover:border-forest/50 text-xs font-sans text-forest/70 transition"
          >
            <Plus className="w-3 h-3" strokeWidth={1.5} />
            Eigene Pflanze hinzufügen
          </button>
        </div>
      </section>
    </div>
  );
}
