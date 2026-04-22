"use client";

import { Boxes, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Module2Data, Zone } from "@/lib/types/module2";

const ZONE_KINDS = [
  { value: "entspannung", label: "Entspannung", color: "bg-forest/10 text-forest border-forest/25" },
  { value: "arbeit",      label: "Arbeit",      color: "bg-sand/20 text-[#8a6030] border-sand/40" },
  { value: "schlaf",      label: "Schlaf",      color: "bg-mint/20 text-forest border-mint/40" },
  { value: "essen",       label: "Essen",       color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "kreativ",     label: "Kreativ",     color: "bg-red-50 text-red-600 border-red-200" },
  { value: "bewegung",    label: "Bewegung",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "stauraum",    label: "Stauraum",    color: "bg-gray-100 text-gray-600 border-gray-200" },
] as const;

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step04({ data, onChange }: Props) {
  const zones = data.zones ?? [];

  function addZone(kind: string) {
    onChange({
      zones: [...zones, { id: uid(), kind, label: "", notes: "" }],
    });
  }

  function updateZone(id: string, patch: Partial<Zone>) {
    onChange({ zones: zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) });
  }

  function removeZone(id: string) {
    onChange({ zones: zones.filter((z) => z.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Boxes className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Welche Zonen braucht dein Raum?</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Ein guter Raum hat klare Zonen. Definiere jetzt, wofür welcher Bereich gedacht ist —
          so bekommt jedes Möbelstück später einen natürlichen Platz.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {zones.map((z) => {
          const kindCfg = ZONE_KINDS.find((k) => k.value === z.kind);
          return (
            <div key={z.id} className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <span className={cn("inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-sans font-medium uppercase tracking-wider", kindCfg?.color ?? "bg-gray-100 text-gray-600 border-gray-200")}>
                  {kindCfg?.label ?? z.kind}
                </span>
                <button
                  type="button"
                  onClick={() => removeZone(z.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Zone entfernen"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <Input
                placeholder="Zone benennen, z. B. Leseecke am Fenster"
                value={z.label}
                onChange={(e) => updateZone(z.id, { label: e.target.value })}
              />
              <Input
                placeholder="Notiz — was soll hier passieren?"
                value={z.notes}
                onChange={(e) => updateZone(z.id, { notes: e.target.value })}
              />
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
          Zone hinzufügen
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ZONE_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => addZone(k.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sand/40 bg-cream text-xs font-sans text-forest/70 hover:border-forest/40 hover:bg-mint/10 transition-colors"
            >
              <Plus className="w-3 h-3" strokeWidth={1.5} />
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
