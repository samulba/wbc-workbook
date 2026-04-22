"use client";

import { Palette, Plus, Trash2, Shuffle, Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module2Data } from "@/lib/types/module2";

// ── Preset palettes — each gets a big visual treatment ─────────────────────

type Preset = {
  label:     string;
  mood:      string;
  primary:   string[];
  secondary: string[];
  accent:    string;
};

const PRESETS: Preset[] = [
  {
    label: "Warm Sand",  mood: "Erdig · Einladend",
    primary: ["#f5efe6", "#e5d6b8"], secondary: ["#9a8866", "#3a3228"], accent: "#c97d5f",
  },
  {
    label: "Forest Calm", mood: "Natürlich · Ruhig",
    primary: ["#eef0e8", "#b7c3ae"], secondary: ["#5a6f5a", "#2b3628"], accent: "#c7b07a",
  },
  {
    label: "Ocean Mist",  mood: "Kühl · Klar",
    primary: ["#f3f5f3", "#c4d4d8"], secondary: ["#6d868c", "#29383d"], accent: "#d8a878",
  },
  {
    label: "Muted Clay",  mood: "Warm · Grounded",
    primary: ["#eee1d3", "#c89a7a"], secondary: ["#6a4e3a", "#2f201b"], accent: "#a3b58a",
  },
  {
    label: "Monochrome",  mood: "Clean · Puristisch",
    primary: ["#fafaf8", "#dad6cf"], secondary: ["#8a8679", "#2d2a25"], accent: "#c49a6c",
  },
  {
    label: "Jewel Tones", mood: "Edel · Tief",
    primary: ["#f4efe6", "#d4c19a"], secondary: ["#4a5e6e", "#1c2128"], accent: "#8b3a4c",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

function isHex(v: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(v);
}

function swatchBg(v: string) {
  return isHex(v) ? v : "#ece6db";
}

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

  function applyPreset(p: Preset) {
    onChange({
      palette_primary:   [...p.primary],
      palette_secondary: [...p.secondary],
      palette_accent:    p.accent,
    });
  }

  function randomPreset() {
    const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    applyPreset(p);
  }

  // ── Derived palette for the preview ────────────────────────
  const allColors = [...primary, ...secondary, accent].filter(isHex);
  const hasAny    = allColors.length > 0;

  const wallColor   = (isHex(primary[0]  ?? "") ? primary[0]   : null) ?? (isHex(secondary[0] ?? "") ? secondary[0] : null) ?? "#eee";
  const floorColor  = (isHex(primary[1]  ?? "") ? primary[1]   : null) ?? (isHex(secondary[0] ?? "") ? secondary[0] : null) ?? "#d4cab8";
  const sofaColor   = (isHex(secondary[0] ?? "") ? secondary[0] : null) ?? (isHex(primary[1]  ?? "") ? primary[1]  : null) ?? "#8a7a66";
  const cushionColor= isHex(accent) ? accent : (isHex(secondary[1] ?? "") ? secondary[1] : "#c97d5f");
  const shadowColor = (isHex(secondary[1] ?? "") ? secondary[1] : null) ?? "#2b2620";

  return (
    <div className="flex flex-col gap-8">

      {/* ── Intro ──────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-forest/6 to-mint/10 border border-forest/15 p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm">
          <Palette className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-headline text-lg text-forest mb-0.5">Deine Farbwelt</h3>
          <p className="text-sm text-gray/65 font-sans leading-relaxed">
            2–3 ruhige Hauptfarben, 1–2 tragende Sekundärfarben, genau ein Akzent — die 60/30/10-Regel
            macht jeden Raum sofort ruhiger.
          </p>
        </div>
      </div>

      {/* ── Room preview ───────────────────────────────────── */}
      <RoomPreview
        wall={wallColor} floor={floorColor} sofa={sofaColor}
        cushion={cushionColor} shadow={shadowColor} hasAny={hasAny}
      />

      {/* ── 60/30/10 proportional ribbon ──────────────────── */}
      {hasAny && <ProportionRibbon primary={primary} secondary={secondary} accent={accent} />}

      {/* ── Presets ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-sand font-sans font-medium">
            Schnellstart-Paletten
          </p>
          <button
            type="button"
            onClick={randomPreset}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-forest/70 hover:text-forest transition-colors"
          >
            <Shuffle className="w-3 h-3" strokeWidth={1.75} />
            Zufall
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {PRESETS.map((p) => (
            <PresetCard key={p.label} preset={p} onApply={() => applyPreset(p)} />
          ))}
        </div>
      </div>

      {/* ── Primary / Secondary / Accent ───────────────────── */}
      <PaletteList
        label="Primärfarben"
        hint="2–3 Töne für große Flächen (Wand, Böden, Sofa)"
        proportion="≈ 60 %"
        colors={primary}
        max={5}
        onChange={(i, v) => updateList("primary", i, v)}
        onAdd={() => addColor("primary")}
        onRemove={(i) => removeColor("primary", i)}
      />

      <PaletteList
        label="Sekundärfarben"
        hint="1–2 tragende Töne für Textilien & Möbel"
        proportion="≈ 30 %"
        colors={secondary}
        max={5}
        onChange={(i, v) => updateList("secondary", i, v)}
        onAdd={() => addColor("secondary")}
        onRemove={(i) => removeColor("secondary", i)}
      />

      <AccentPicker
        value={accent}
        onChange={(v) => onChange({ palette_accent: v })}
      />
    </div>
  );
}

// ── Room preview illustration ──────────────────────────────────────────────

function RoomPreview({
  wall, floor, sofa, cushion, shadow, hasAny,
}: {
  wall: string; floor: string; sofa: string; cushion: string; shadow: string; hasAny: boolean;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-sand/40 shadow-warm-sm">
      <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Wall */}
        <rect x="0" y="0" width="800" height="290" fill={wall} />
        {/* Floor with perspective */}
        <polygon points="0,290 800,290 800,450 0,450" fill={floor} />
        <polygon points="0,290 800,290 800,305 0,305" fill={shadow} opacity="0.12" />

        {/* Window (hint of light) */}
        <rect x="540" y="60" width="180" height="140" fill="#f7f3ea" opacity="0.35" rx="4" />
        <line x1="630" y1="60"  x2="630" y2="200" stroke={shadow} strokeWidth="2" opacity="0.15" />
        <line x1="540" y1="130" x2="720" y2="130" stroke={shadow} strokeWidth="2" opacity="0.15" />

        {/* Sofa — long cushion base */}
        <rect x="100" y="230" width="300" height="90" rx="16" fill={sofa} />
        {/* Sofa back */}
        <rect x="100" y="195" width="300" height="55" rx="12" fill={sofa} />
        <rect x="100" y="195" width="300" height="55" rx="12" fill={shadow} opacity="0.18" />
        {/* Sofa legs */}
        <rect x="118" y="320" width="10" height="16" fill={shadow} opacity="0.55" />
        <rect x="372" y="320" width="10" height="16" fill={shadow} opacity="0.55" />

        {/* Cushions (accent) */}
        <rect x="135" y="215" width="60" height="45" rx="8"  fill={cushion} />
        <rect x="205" y="215" width="60" height="45" rx="8"  fill={cushion} opacity="0.85" />

        {/* Side table */}
        <rect x="430" y="275" width="70" height="55" rx="4" fill={shadow} opacity="0.65" />
        {/* Lamp stand */}
        <rect x="460" y="200" width="4" height="75" fill={shadow} opacity="0.55" />
        <polygon points="435,200 490,200 475,170 450,170" fill={cushion} opacity="0.8" />

        {/* Plant */}
        <rect x="600" y="290" width="50" height="35" rx="2" fill={shadow} opacity="0.5" />
        <path d="M 625 290 Q 610 260 615 230 Q 620 210 625 230 Q 640 250 635 280 Z" fill={sofa} opacity="0.75" />
        <path d="M 625 290 Q 645 270 650 240 Q 645 225 640 245 Q 635 270 625 285 Z" fill={sofa} />

        {/* Floor shadow under sofa */}
        <ellipse cx="250" cy="330" rx="170" ry="8" fill={shadow} opacity="0.18" />

        {/* Title overlay if empty */}
        {!hasAny && (
          <text x="400" y="225" fontFamily="system-ui" fontSize="14" textAnchor="middle" fill={shadow} opacity="0.45">
            Wähle eine Palette, um die Vorschau zu sehen
          </text>
        )}
      </svg>

      {/* Label chip */}
      <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm border border-white/60 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-forest" />
        <span className="text-[10px] uppercase tracking-widest font-sans font-medium text-forest">Live-Vorschau</span>
      </div>
    </div>
  );
}

// ── 60/30/10 Ribbon ────────────────────────────────────────────────────────

function ProportionRibbon({
  primary, secondary, accent,
}: {
  primary: string[]; secondary: string[]; accent: string;
}) {
  const pri = primary.filter(isHex);
  const sec = secondary.filter(isHex);
  const acc = isHex(accent) ? accent : null;

  const segments: { color: string; weight: number; label?: string }[] = [];
  if (pri.length > 0) {
    const each = 60 / pri.length;
    pri.forEach((c, i) => segments.push({ color: c, weight: each, label: i === 0 ? "60%" : undefined }));
  }
  if (sec.length > 0) {
    const each = 30 / sec.length;
    sec.forEach((c, i) => segments.push({ color: c, weight: each, label: i === 0 ? "30%" : undefined }));
  }
  if (acc) segments.push({ color: acc, weight: 10, label: "10%" });

  if (segments.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-sand font-sans mb-2 font-medium">
        60 / 30 / 10 — so wirkt deine Palette
      </p>
      <div className="relative h-10 rounded-lg overflow-hidden flex border border-sand/30 shadow-sm">
        {segments.map((s, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{ backgroundColor: s.color, flexBasis: `${s.weight}%` }}
            title={s.color}
          >
            {s.label && (
              <span
                className="text-[10px] font-sans font-semibold tabular-nums"
                style={{
                  color:      isLight(s.color) ? "#2b2620" : "#fff",
                  textShadow: isLight(s.color) ? "none" : "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                {s.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Preset card ────────────────────────────────────────────────────────────

function PresetCard({ preset, onApply }: { preset: Preset; onApply: () => void }) {
  const all = [...preset.primary, ...preset.secondary, preset.accent];
  return (
    <button
      type="button"
      onClick={onApply}
      className="group relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-forest/30 hover:shadow-warm-sm transition-all active:scale-[0.98] text-left"
    >
      {/* Palette band */}
      <div className="h-16 flex">
        {all.map((c, i) => (
          <div key={i} className="flex-1 transition-all" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="px-3 py-2.5 bg-white flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-sans font-semibold text-forest leading-tight truncate">{preset.label}</p>
          <p className="text-[11px] text-gray/55 font-sans leading-tight mt-0.5 truncate">{preset.mood}</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-sans font-medium text-forest/70 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          Anwenden
        </span>
      </div>
    </button>
  );
}

// ── Palette list (primary / secondary) ─────────────────────────────────────

function PaletteList({
  label, hint, proportion, colors, max, onChange, onAdd, onRemove,
}: {
  label:      string;
  hint:       string;
  proportion: string;
  colors:     string[];
  max:        number;
  onChange:   (index: number, v: string) => void;
  onAdd:      () => void;
  onRemove:   (index: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-sand/40 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-sand font-sans font-medium">{label}</p>
          <p className="text-xs text-gray/55 font-sans mt-0.5">{hint}</p>
        </div>
        <span className="text-[11px] font-sans font-semibold text-forest/70 bg-forest/5 border border-forest/10 px-2.5 py-0.5 rounded-full shrink-0">
          {proportion}
        </span>
      </div>

      {colors.length === 0 && (
        <p className="text-xs text-gray/45 font-sans italic mb-3">Noch keine Farben.</p>
      )}

      <div className="flex flex-col gap-2.5">
        {colors.map((c, i) => (
          <ColorRow
            key={i}
            value={c}
            onChange={(v) => onChange(i, v)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>

      {colors.length < max && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-forest/30 bg-white hover:border-forest/50 hover:bg-forest/5 text-xs font-sans text-forest/70 transition"
        >
          <Plus className="w-3 h-3" strokeWidth={1.75} />
          Farbe hinzufügen
        </button>
      )}
    </div>
  );
}

// ── Accent picker (single) ─────────────────────────────────────────────────

function AccentPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const valid = isHex(value);
  return (
    <div className="rounded-2xl border border-sand/40 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-sand font-sans font-medium">Akzentfarbe</p>
          <p className="text-xs text-gray/55 font-sans mt-0.5">Genau eine – Kissen, Vase, Kunst</p>
        </div>
        <span className="text-[11px] font-sans font-semibold text-forest/70 bg-forest/5 border border-forest/10 px-2.5 py-0.5 rounded-full shrink-0">
          ≈ 10 %
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-xl border border-sand/40 shadow-inner"
            style={{ backgroundColor: swatchBg(value) }}
          />
          <input
            type="color"
            value={valid ? value : "#c97d5f"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Farbwähler"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-sand/40 shadow-sm flex items-center justify-center pointer-events-none">
            <Pipette className="w-2.5 h-2.5 text-forest/60" strokeWidth={2} />
          </span>
        </div>

        <input
          type="text"
          placeholder="#c97d5f"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-11 px-3 rounded-lg border border-sand/40 bg-cream/60 font-mono text-sm text-forest focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent"
        />
      </div>
    </div>
  );
}

// ── Single color row ──────────────────────────────────────────────────────

function ColorRow({
  value, onChange, onRemove,
}: {
  value:    string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const valid = isHex(value);
  return (
    <div className="flex items-center gap-3">
      {/* Big swatch w/ native picker overlay */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-xl border border-sand/40 shadow-inner"
          style={{ backgroundColor: swatchBg(value) }}
        />
        <input
          type="color"
          value={valid ? value : "#cccccc"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="Farbwähler"
        />
      </div>

      {/* Hex input */}
      <input
        type="text"
        placeholder="#hex"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex-1 min-w-0 h-10 px-3 rounded-lg border bg-cream/60 font-mono text-sm text-forest focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
          valid ? "border-sand/40" : "border-sand/40",
        )}
      />

      {/* Delete */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
        aria-label="Farbe entfernen"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isLight(hex: string): boolean {
  if (!isHex(hex)) return true;
  const h = hex.length === 4
    ? "#" + Array.from(hex.slice(1)).map((c) => c + c).join("")
    : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.6;
}
