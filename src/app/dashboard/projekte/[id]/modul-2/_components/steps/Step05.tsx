"use client";

import { Sofa, CheckCircle2, X, Sparkles, Plus, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Module2Data, FurnitureEntry } from "@/lib/types/module2";

type ListKey = "keep" | "remove" | "wish";

const LISTS: { key: ListKey; label: string; hint: string; Icon: LucideIcon; tone: string }[] = [
  { key: "keep",   label: "Bleibt",    hint: "Was gefällt dir und darf bleiben?",             Icon: CheckCircle2, tone: "border-forest/30 bg-forest/5" },
  { key: "remove", label: "Weg",       hint: "Was passt nicht mehr ins neue Konzept?",         Icon: X,            tone: "border-red-200 bg-red-50/50" },
  { key: "wish",   label: "Wunsch",    hint: "Was fehlt — was möchtest du dir neu anschaffen?", Icon: Sparkles,     tone: "border-sand/50 bg-cream" },
];

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step05({ data, onChange }: Props) {
  const lists: Record<ListKey, FurnitureEntry[]> = {
    keep:   data.furniture_keep   ?? [],
    remove: data.furniture_remove ?? [],
    wish:   data.furniture_wish   ?? [],
  };

  function patchList(key: ListKey, next: FurnitureEntry[]) {
    if (key === "keep")   onChange({ furniture_keep:   next });
    if (key === "remove") onChange({ furniture_remove: next });
    if (key === "wish")   onChange({ furniture_wish:   next });
  }

  function addEntry(key: ListKey) {
    const condition: FurnitureEntry["condition"] = key === "keep" ? "keep" : key === "remove" ? "remove" : "wish";
    patchList(key, [...lists[key], { id: uid(), name: "", category: "", condition, notes: "" }]);
  }

  function updateEntry(key: ListKey, id: string, patch: Partial<FurnitureEntry>) {
    patchList(key, lists[key].map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(key: ListKey, id: string) {
    patchList(key, lists[key].filter((e) => e.id !== id));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sofa className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Was hast du, was brauchst du?</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Mach eine ehrliche Inventur. Was bleibt, was muss weg, was möchtest du dir neu holen?
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {LISTS.map(({ key, label, hint, Icon, tone }) => {
          const entries = lists[key];
          return (
            <div key={key} className={cn("rounded-2xl border p-4 flex flex-col gap-3", tone)}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-forest" strokeWidth={1.5} />
                <h4 className="font-headline text-base text-forest">{label}</h4>
                <span className="text-xs text-gray/50 font-sans ml-auto">{entries.length}</span>
              </div>
              <p className="text-xs text-gray/55 font-sans">{hint}</p>

              {entries.map((e) => (
                <div key={e.id} className="rounded-lg border border-sand/30 bg-white p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      placeholder="z. B. Sofa — Ikea Kivik, grau"
                      value={e.name}
                      onChange={(ev) => updateEntry(key, e.id, { name: ev.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeEntry(key, e.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      aria-label="Eintrag entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <Input
                    placeholder="Notiz — Farbe, Maße, Zustand …"
                    value={e.notes}
                    onChange={(ev) => updateEntry(key, e.id, { notes: ev.target.value })}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addEntry(key)}
                className="self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-forest/30 bg-white hover:border-forest/50 text-xs font-sans text-forest/70 transition"
              >
                <Plus className="w-3 h-3" strokeWidth={1.5} />
                Eintrag hinzufügen
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
