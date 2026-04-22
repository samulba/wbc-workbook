"use client";

import { Palette, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Module2Data } from "@/lib/types/module2";

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

// Quick-pick palette suggestions
const SUGGESTED_PALETTES = [
  { label: "Warm Sand",   primary: ["#f5efe6", "#e5d6b8"], secondary: ["#9a8866", "#3a3228"], accent: "#c97d5f" },
  { label: "Forest Calm", primary: ["#eef0e8", "#b7c3ae"], secondary: ["#5a6f5a", "#2b3628"], accent: "#c7b07a" },
  { label: "Ocean Mist",  primary: ["#f3f5f3", "#c4d4d8"], secondary: ["#6d868c", "#29383d"], accent: "#d8a878" },
  { label: "Muted Clay",  primary: ["#eee1d3", "#c89a7a"], secondary: ["#6a4e3a", "#2f201b"], accent: "#a3b58a" },
];

export function Step02({ data, onChange }: Props) {
  const primary   = data.palette_primary   ?? [];
  const secondary = data.palette_secondary ?? [];
  const accent    = data.palette_accent    ?? "";

  function updateList(list: "primary" | "secondary", index: number, value: string) {
    const src = list === "primary" ? primary : secondary;
    const next = [...src];
    next[index] = value;
    onChange(list === "primary" ? { palette_primary: next } : { palette_secondary: next });
  }

  function addColor(list: "primary" | "secondary") {
    const src = list === "primary" ? primary : secondary;
    if (src.length >= 5) return;
    onChange(list === "primary" ? { palette_primary: [...src, "#"] } : { palette_secondary: [...src, "#"] });
  }

  function removeColor(list: "primary" | "secondary", index: number) {
    const src  = list === "primary" ? primary : secondary;
    const next = src.filter((_, i) => i !== index);
    onChange(list === "primary" ? { palette_primary: next } : { palette_secondary: next });
  }

  function applyPreset(p: typeof SUGGESTED_PALETTES[number]) {
    onChange({
      palette_primary:   [...p.primary],
      palette_secondary: [...p.secondary],
      palette_accent:    p.accent,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Deine Farbwelt</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Eine gute Palette hat 2–3 ruhige Hauptfarben, 1–2 tragende Sekundärfarben und genau einen Akzent.
        </p>
      </div>

      {/* Quick presets */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
          Schnellstart-Paletten
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SUGGESTED_PALETTES.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-xl border border-sand/30 bg-white hover:border-forest/30 active:scale-[0.98] transition p-3 text-left"
            >
              <div className="flex h-4 rounded overflow-hidden mb-2 border border-black/5">
                {[...p.primary, ...p.secondary, p.accent].map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <p className="text-xs font-sans font-medium text-forest/75">{p.label}</p>
            </button>
          ))}
        </div>
      </div>

      <PaletteList
        label="Primärfarben (2–3)"
        colors={primary}
        max={5}
        onChange={(i, v) => updateList("primary", i, v)}
        onAdd={() => addColor("primary")}
        onRemove={(i) => removeColor("primary", i)}
      />

      <PaletteList
        label="Sekundärfarben"
        colors={secondary}
        max={5}
        onChange={(i, v) => updateList("secondary", i, v)}
        onAdd={() => addColor("secondary")}
        onRemove={(i) => removeColor("secondary", i)}
      />

      {/* Accent */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Akzentfarbe</p>
        <div className="flex items-center gap-3">
          <ColorSwatch value={accent} />
          <Input
            placeholder="#c97d5f"
            value={accent}
            onChange={(e) => onChange({ palette_accent: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function PaletteList({
  label, colors, max, onChange, onAdd, onRemove,
}: {
  label:    string;
  colors:   string[];
  max:      number;
  onChange: (index: number, v: string) => void;
  onAdd:    () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest text-sand font-sans">{label}</p>
      {colors.length === 0 && (
        <p className="text-xs text-gray/45 font-sans italic">Keine Farben – füge welche hinzu.</p>
      )}
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-3">
          <ColorSwatch value={c} />
          <Input
            placeholder="#"
            value={c}
            onChange={(e) => onChange(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            aria-label="Farbe entfernen"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      ))}
      {colors.length < max && (
        <button
          type="button"
          onClick={onAdd}
          className="self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-sand/50 bg-cream hover:border-forest/40 text-xs font-sans text-forest/70 transition"
        >
          <Plus className="w-3 h-3" strokeWidth={1.5} />
          Farbe hinzufügen
        </button>
      )}
    </div>
  );
}

function ColorSwatch({ value }: { value: string }) {
  const isHex = /^#[0-9a-fA-F]{3,6}$/.test(value);
  return (
    <span
      className="w-8 h-8 rounded-lg border border-sand/30 shadow-sm shrink-0"
      style={{ backgroundColor: isHex ? value : "#ece6db" }}
      title={value}
    />
  );
}
