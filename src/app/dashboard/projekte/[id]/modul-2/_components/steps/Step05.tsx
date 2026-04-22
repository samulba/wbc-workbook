"use client";

import { useState } from "react";
import {
  Sofa, Armchair, Table, Bed, Lamp, BookOpen,
  Package, CheckCircle2, X, Sparkles, Plus, Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module2Data, FurnitureEntry } from "@/lib/types/module2";

type ListKey = "keep" | "remove" | "wish";

type Category = {
  value: string;
  label: string;
  Icon:  LucideIcon;
};

const CATEGORIES: Category[] = [
  { value: "sofa",     label: "Sofa / Sessel", Icon: Sofa     },
  { value: "stuhl",    label: "Stuhl",          Icon: Armchair },
  { value: "tisch",    label: "Tisch",          Icon: Table    },
  { value: "bett",     label: "Bett",           Icon: Bed      },
  { value: "regal",    label: "Regal / Schrank", Icon: BookOpen },
  { value: "licht",    label: "Leuchte",        Icon: Lamp     },
  { value: "sonstige", label: "Sonstige",       Icon: Package  },
];

const CAT_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c]),
);

const LISTS: {
  key: ListKey; label: string; hint: string; Icon: LucideIcon;
  tone: string; accent: string; chipTone: string;
}[] = [
  {
    key: "keep", label: "Bleibt", hint: "Was gefällt dir und darf bleiben?",
    Icon: CheckCircle2,
    tone:     "from-forest/8 to-mint/12 border-forest/25",
    accent:   "text-forest",
    chipTone: "bg-forest/10 border-forest/20 text-forest",
  },
  {
    key: "remove", label: "Weg", hint: "Was passt nicht mehr ins neue Konzept?",
    Icon: X,
    tone:     "from-red-50 to-red-50/50 border-red-200",
    accent:   "text-red-600/80",
    chipTone: "bg-red-100 border-red-200 text-red-600/70",
  },
  {
    key: "wish", label: "Wunsch", hint: "Was fehlt — was möchtest du dir neu holen?",
    Icon: Sparkles,
    tone:     "from-sand/15 to-sand/5 border-sand/40",
    accent:   "text-[#8a6030]",
    chipTone: "bg-sand/20 border-sand/40 text-[#8a6030]",
  },
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

  const [addingTo, setAddingTo] = useState<ListKey | null>(null);

  function patchList(key: ListKey, next: FurnitureEntry[]) {
    if (key === "keep")   onChange({ furniture_keep:   next });
    if (key === "remove") onChange({ furniture_remove: next });
    if (key === "wish")   onChange({ furniture_wish:   next });
  }

  function addEntry(key: ListKey, category: string) {
    const condition: FurnitureEntry["condition"] = key === "keep" ? "keep" : key === "remove" ? "remove" : "wish";
    patchList(key, [...lists[key], { id: uid(), name: "", category, condition, notes: "" }]);
    setAddingTo(null);
  }

  function updateEntry(key: ListKey, id: string, patch: Partial<FurnitureEntry>) {
    patchList(key, lists[key].map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(key: ListKey, id: string) {
    patchList(key, lists[key].filter((e) => e.id !== id));
  }

  const totalEntries = lists.keep.length + lists.remove.length + lists.wish.length;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Intro ──────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-forest/6 to-mint/10 border border-forest/15 p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm">
          <Sofa className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-headline text-lg text-forest mb-0.5">Was hast du, was brauchst du?</h3>
          <p className="text-sm text-gray/65 font-sans leading-relaxed">
            Mach eine ehrliche Inventur: was bleibt, was muss weg, was möchtest du dir neu holen?
            Das wird dein Möbel-Fundament für die nächsten Schritte.
          </p>
        </div>
      </div>

      {/* ── Inventar-Stats ────────────────────────────────── */}
      {totalEntries > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {LISTS.map(({ key, label, accent }) => (
            <div key={key} className="rounded-xl border border-sand/30 bg-white px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-sand font-sans">{label}</p>
              <p className={cn("font-headline text-xl tabular-nums mt-0.5", accent)}>
                {lists[key].length}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Lists ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {LISTS.map(({ key, label, hint, Icon, tone, accent, chipTone }) => {
          const entries = lists[key];
          const isAdding = addingTo === key;
          return (
            <div key={key} className={cn("rounded-2xl border bg-gradient-to-br p-4", tone)}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center">
                  <Icon className={cn("w-4 h-4", accent)} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn("font-headline text-base leading-tight", accent)}>{label}</h4>
                  <p className="text-[11px] text-gray/55 font-sans leading-tight">{hint}</p>
                </div>
                <span className={cn("text-[11px] font-sans font-semibold tabular-nums px-2 py-0.5 rounded-full border", chipTone)}>
                  {entries.length}
                </span>
              </div>

              {/* Entries */}
              {entries.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {entries.map((e) => (
                    <FurnitureCard
                      key={e.id}
                      entry={e}
                      onUpdate={(patch) => updateEntry(key, e.id, patch)}
                      onRemove={() => removeEntry(key, e.id)}
                    />
                  ))}
                </div>
              )}

              {/* Category picker → add button */}
              {isAdding ? (
                <div className="rounded-xl bg-white/80 border border-sand/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] uppercase tracking-widest text-sand font-sans font-medium">
                      Welche Kategorie?
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddingTo(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Abbrechen
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => addEntry(key, c.value)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border border-sand/30 bg-white hover:border-forest/30 hover:bg-mint/5 active:scale-[0.97] transition"
                      >
                        <c.Icon className="w-4 h-4 text-forest/60" strokeWidth={1.5} />
                        <span className="text-[10px] font-sans text-forest/70 text-center leading-tight">
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTo(key)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-dashed border-forest/30 bg-white/60 hover:border-forest/50 hover:bg-white text-sm font-sans text-forest/70 transition"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Eintrag hinzufügen
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Single furniture card ──────────────────────────────────────────────────

function FurnitureCard({
  entry, onUpdate, onRemove,
}: {
  entry:    FurnitureEntry;
  onUpdate: (patch: Partial<FurnitureEntry>) => void;
  onRemove: () => void;
}) {
  const cat = CAT_MAP[entry.category] ?? CAT_MAP.sonstige;
  const CatIcon = cat.Icon;

  return (
    <div className="rounded-xl border border-sand/30 bg-white overflow-hidden">
      {/* Header row with category + delete */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-cream/40">
        <div className="w-7 h-7 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
          <CatIcon className="w-3.5 h-3.5 text-forest/70" strokeWidth={1.5} />
        </div>
        <select
          value={entry.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
          className="flex-1 min-w-0 bg-transparent text-[11px] font-sans font-medium uppercase tracking-widest text-forest/70 outline-none cursor-pointer border-b border-transparent hover:border-sand/40 py-0.5"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
          aria-label="Eintrag entfernen"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Name + notes — no trash here so full width */}
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <input
          type="text"
          placeholder="Name"
          value={entry.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-transparent text-sm font-sans font-medium text-forest placeholder:text-gray-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Details — Farbe · Maße · Zustand …"
          value={entry.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="w-full bg-transparent text-xs font-sans text-gray/60 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
