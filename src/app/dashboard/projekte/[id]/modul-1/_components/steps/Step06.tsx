"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";
import type { Module1Data } from "@/lib/types/module1";
import { ProductRecommendations } from "../ProductRecommendations";

interface Props {
  data:     Module1Data;
  roomType: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

// ── Color catalog (hex + vibe label) ─────────────────────────────────────────

type ColorCard = {
  name:    string;
  hex:     string;
  mood:    string;
  style?:  string;           // optional CSS for gradient-based swatches
};

const PRIMARY_COLORS: ColorCard[] = [
  { name: "Cloud-White",   hex: "#f7f4ee", mood: "Offen · klar · leicht" },
  { name: "Linen-Beige",   hex: "#e7ddcc", mood: "Warm · ausgeglichen" },
  { name: "Stone-Grau",    hex: "#c5c2bc", mood: "Ruhig · neutral" },
  { name: "Sage-Grün",     hex: "#b5c8ae", mood: "Erdend · beruhigend" },
  { name: "Deep-Forest",   hex: "#3e5146", mood: "Geerdet · charaktervoll" },
  { name: "Midnight-Blau", hex: "#223044", mood: "Tief · fokussiert" },
  { name: "Warmes Taupe",  hex: "#a18f7b", mood: "Sanft · wohnlich" },
  { name: "Pure Black",    hex: "#1a1a1a", mood: "Grafisch · reduziert" },
];

const SECONDARY_COLORS: ColorCard[] = [
  { name: "Mint",          hex: "#a9cdb5", mood: "Frisch · leicht" },
  { name: "Eucalyptus",    hex: "#6d8b77", mood: "Natürlich · ruhig" },
  { name: "Terra-Rot",     hex: "#a5502f", mood: "Warm · lebendig" },
  { name: "Sand-Ocker",    hex: "#cba178", mood: "Sonnig · warm" },
  { name: "Blush-Rosa",    hex: "#dcb9b2", mood: "Sanft · weich" },
  { name: "Ocean-Blau",    hex: "#5d7f94", mood: "Klar · kühl" },
  { name: "Honig-Gelb",    hex: "#d6a54c", mood: "Hell · motivierend" },
  { name: "Mocha",         hex: "#6b4b3b", mood: "Tief · erdend" },
];

const ACCENT_COLORS: ColorCard[] = [
  { name: "Messing",       hex: "#b89b5a", mood: "Edel · wärmend" },
  { name: "Terracotta",    hex: "#823509", mood: "Kräftig · erdig" },
  { name: "Petrol",        hex: "#1e4a54", mood: "Edler Kontrast" },
  { name: "Rosenholz",     hex: "#b57471", mood: "Feminin · warm" },
  { name: "Schwarz",       hex: "#111111", mood: "Grafisch · klar" },
  { name: "Goldgelb",      hex: "#c98d18", mood: "Optimistisch" },
];

// ── Material catalog (CSS-driven gradient "textures") ────────────────────────

type Material = {
  value:   string;
  label:   string;
  mood:    string;
  category:"natur" | "textil" | "modern" | "spezial";
  bg:      string;            // CSS gradient/background that evokes the material
};

const MATERIALS: Material[] = [
  // Natur
  { value:"holz_hell", label:"Holz hell", mood:"Warm · natürlich", category:"natur",
    bg:"linear-gradient(120deg, #e9d2a9 0%, #d6b98a 60%, #c9a572 100%)" },
  { value:"holz_dunkel", label:"Holz dunkel", mood:"Erdend · gemütlich", category:"natur",
    bg:"linear-gradient(120deg, #6b4b34 0%, #523824 60%, #402b18 100%)" },
  { value:"stein", label:"Stein", mood:"Kühl · massiv", category:"natur",
    bg:"linear-gradient(120deg, #a19c92 0%, #7a756c 60%, #5a564f 100%)" },
  { value:"marmor", label:"Marmor", mood:"Elegant · edel", category:"natur",
    bg:"linear-gradient(120deg, #f0ebe2 0%, #d9d2c6 40%, #e8e2d5 60%, #c8c0b2 100%)" },
  { value:"kork", label:"Kork", mood:"Weich · warm", category:"natur",
    bg:"linear-gradient(120deg, #c8a070 0%, #b48656 60%, #a2744a 100%)" },
  { value:"bambus", label:"Bambus", mood:"Leicht · luftig", category:"natur",
    bg:"linear-gradient(120deg, #d2c294 0%, #b8ad80 60%, #9e946d 100%)" },

  // Textil
  { value:"leinen", label:"Leinen", mood:"Natürlich · ruhig", category:"textil",
    bg:"linear-gradient(135deg, #ede4d1 0%, #d8ccb5 60%, #c5b79a 100%)" },
  { value:"samt", label:"Samt", mood:"Luxuriös · weich", category:"textil",
    bg:"linear-gradient(135deg, #7a4b5c 0%, #5a3245 60%, #3d1e2e 100%)" },
  { value:"wolle", label:"Wolle", mood:"Warm · dicht", category:"textil",
    bg:"linear-gradient(135deg, #cec2b2 0%, #b2a591 60%, #998b78 100%)" },
  { value:"baumwolle", label:"Baumwolle", mood:"Leicht · alltäglich", category:"textil",
    bg:"linear-gradient(135deg, #f0ebe2 0%, #e2dace 60%, #d0c7b6 100%)" },
  { value:"jute", label:"Jute", mood:"Rustikal · grob", category:"textil",
    bg:"linear-gradient(135deg, #c9a46e 0%, #b08855 60%, #8e693d 100%)" },

  // Modern
  { value:"glas", label:"Glas", mood:"Klar · modern", category:"modern",
    bg:"linear-gradient(135deg, rgba(183,210,220,0.85) 0%, rgba(213,229,233,0.75) 50%, rgba(155,185,200,0.85) 100%)" },
  { value:"metall", label:"Metall", mood:"Industrial · kühl", category:"modern",
    bg:"linear-gradient(135deg, #9098a0 0%, #6a7178 50%, #4d535a 100%)" },
  { value:"beton", label:"Beton", mood:"Roh · minimal", category:"modern",
    bg:"linear-gradient(135deg, #b9b6af 0%, #8f8c84 60%, #676560 100%)" },
  { value:"leder", label:"Leder", mood:"Warm · langlebig", category:"modern",
    bg:"linear-gradient(135deg, #7a4a28 0%, #5d3a1e 60%, #422815 100%)" },

  // Spezial
  { value:"rattan", label:"Rattan", mood:"Boho · luftig", category:"spezial",
    bg:"linear-gradient(135deg, #d4b082 0%, #bb9463 60%, #9c7a4b 100%)" },
  { value:"keramik", label:"Keramik", mood:"Handgemacht · warm", category:"spezial",
    bg:"linear-gradient(135deg, #d2b69a 0%, #b79a7c 60%, #98805f 100%)" },
  { value:"papier", label:"Papier", mood:"Leicht · dezent", category:"spezial",
    bg:"linear-gradient(135deg, #f4ead9 0%, #e6d9c1 60%, #d1bfa1 100%)" },
];

const CATEGORY_ORDER: Material["category"][] = ["natur", "textil", "modern", "spezial"];
const CATEGORY_LABELS: Record<Material["category"], string> = {
  natur:   "Natürlich",
  textil:  "Textil",
  modern:  "Modern",
  spezial: "Spezial",
};

// ── Main ────────────────────────────────────────────────────────────────────

export function Step06({ data, roomType, onChange }: Props) {
  const primary   = useMemo(() => (data.primary_colors   ?? []).filter(Boolean), [data.primary_colors]);
  const secondary = useMemo(() => (data.secondary_colors ?? []).filter(Boolean), [data.secondary_colors]);
  const accent    = data.accent_color ?? "";
  const materials = data.materials ?? [];

  function togglePrimary(hex: string) {
    const has = primary.includes(hex);
    let next = has ? primary.filter((c) => c !== hex) : [...primary, hex];
    if (next.length > 2) next = next.slice(-2);
    onChange({ primary_colors: next });
  }
  function toggleSecondary(hex: string) {
    const has = secondary.includes(hex);
    let next = has ? secondary.filter((c) => c !== hex) : [...secondary, hex];
    if (next.length > 2) next = next.slice(-2);
    onChange({ secondary_colors: next });
  }
  function setAccent(hex: string) {
    onChange({ accent_color: accent === hex ? "" : hex });
  }
  function toggleMaterial(value: string) {
    const has = materials.includes(value);
    onChange({
      materials: has ? materials.filter((m) => m !== value) : [...materials, value],
    });
  }

  const hasPalette = primary.length > 0 || secondary.length > 0 || accent;
  const harmony   = deriveHarmonyNote(primary, secondary, accent);

  return (
    <div className="flex flex-col gap-10 pb-28">

      {/* ── Primärfarben ──────────────────────────────────── */}
      <ColorSection
        title="Primärfarben"
        subtitle="Basis · ca. 60 % · Wände & Boden · max. 2"
        accentBar="bg-forest/60"
      >
        <ColorGrid
          cards={PRIMARY_COLORS}
          selected={primary}
          onToggle={togglePrimary}
          size="lg"
          customChanger={(hex) => togglePrimary(hex)}
        />
      </ColorSection>

      {/* ── Sekundärfarben ──────────────────────────────────── */}
      <ColorSection
        title="Sekundärfarben"
        subtitle="Verstärkung · ca. 30 % · Möbel & Textilien · max. 2"
        accentBar="bg-mint/70"
      >
        <ColorGrid
          cards={SECONDARY_COLORS}
          selected={secondary}
          onToggle={toggleSecondary}
          size="md"
          customChanger={(hex) => toggleSecondary(hex)}
        />
      </ColorSection>

      {/* ── Akzentfarbe ──────────────────────────────────────── */}
      <ColorSection
        title="Akzentfarbe"
        subtitle="Energie · ca. 10 % · Deko & Details · 1"
        accentBar="bg-terracotta/70"
      >
        <ColorGrid
          cards={ACCENT_COLORS}
          selected={accent ? [accent] : []}
          onToggle={setAccent}
          size="sm"
          customChanger={(hex) => setAccent(hex)}
        />
      </ColorSection>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-sand/30" />
        <span className="text-xs text-gray/40 font-sans uppercase tracking-widest">
          Materialien
        </span>
        <div className="flex-1 h-px bg-sand/30" />
      </div>

      {/* ── Materialien ────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Welche Materialien sprechen dich an?
          </h3>
          <p className="text-sm text-gray/55 font-sans">
            Tippe auf jede Karte zum Aus- / Abwählen. Mehrere möglich.
          </p>
        </div>

        {/* Selected thumbnails */}
        {materials.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-forest/15 bg-cream p-2.5">
            <span className="text-[10px] uppercase tracking-widest text-forest/50 pl-1 pr-1.5">
              Auswahl:
            </span>
            {materials.map((m) => {
              const mat = MATERIALS.find((x) => x.value === m);
              if (!mat) {
                return (
                  <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sand/20 text-xs text-forest">
                    {m}
                    <button onClick={() => toggleMaterial(m)} className="text-forest/40 hover:text-terracotta">✕</button>
                  </span>
                );
              }
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMaterial(m)}
                  className="group inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border border-forest/15 bg-white text-xs text-forest hover:border-terracotta/40"
                  aria-label={`${mat.label} entfernen`}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ background: mat.bg }}
                  />
                  {mat.label}
                  <span className="text-forest/30 group-hover:text-terracotta">✕</span>
                </button>
              );
            })}
          </div>
        )}

        {CATEGORY_ORDER.map((cat) => {
          const items = MATERIALS.filter((m) => m.category === cat);
          return (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((mat) => {
                  const selected = materials.includes(mat.value);
                  return (
                    <button
                      key={mat.value}
                      type="button"
                      onClick={() => toggleMaterial(mat.value)}
                      className={cn(
                        "group relative rounded-2xl overflow-hidden border-2 transition-all active:scale-[0.97]",
                        selected
                          ? "border-forest ring-2 ring-mint/40 shadow-md"
                          : "border-transparent hover:border-forest/30",
                      )}
                    >
                      {/* Texture */}
                      <div
                        className="aspect-[4/3] w-full relative overflow-hidden"
                        style={{ background: mat.bg }}
                      >
                        {/* subtle grain overlay */}
                        <div
                          className="absolute inset-0 mix-blend-overlay opacity-40 pointer-events-none"
                          style={{
                            backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)",
                            backgroundSize:  "4px 4px",
                          }}
                        />
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow">
                              <Check className="w-5 h-5 text-forest" strokeWidth={2.5} />
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <div className={cn(
                        "px-3 py-2 flex flex-col items-start text-left transition-colors",
                        selected ? "bg-forest text-white" : "bg-white text-forest"
                      )}>
                        <span className="text-sm font-semibold leading-tight">{mat.label}</span>
                        <span className={cn(
                          "text-[11px] leading-tight",
                          selected ? "text-white/70" : "text-gray/55"
                        )}>
                          {mat.mood}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Sticky palette preview ──────────────────────── */}
      {hasPalette && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,520px)] pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-forest/10 p-3 flex items-center gap-3">
            <div className="flex rounded-lg overflow-hidden h-10 flex-1 shadow-inner bg-forest/5">
              {[...primary, ...secondary, accent].filter(Boolean).map((hex, i) => (
                <div key={`${hex}-${i}`} className="flex-1 h-full" style={{ background: hex }} />
              ))}
            </div>
            {harmony && (
              <span className="text-[11px] font-sans font-medium text-forest/70 shrink-0">
                {harmony}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Product recommendations */}
      <ProductRecommendations
        roomType={roomType}
        mainEffect={data.main_effect}
        roomId={data.room_id ?? null}
        heading="Produkte in deiner Farbwelt"
      />
    </div>
  );
}

// ── Color section wrapper ────────────────────────────────────────────────────

function ColorSection({
  title, subtitle, accentBar, children,
}: {
  title: string;
  subtitle: string;
  accentBar: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-10 rounded-full shrink-0 ${accentBar}`} />
        <div>
          <h3 className="font-headline text-lg text-forest leading-snug">{title}</h3>
          <p className="text-xs text-gray/50 font-sans">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ── Color grid ───────────────────────────────────────────────────────────────

function ColorGrid({
  cards, selected, onToggle, size, customChanger,
}: {
  cards:    ColorCard[];
  selected: string[];
  onToggle: (hex: string) => void;
  size:     "sm" | "md" | "lg";
  customChanger: (hex: string) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customHex, setCustomHex]   = useState("#cba178");

  const aspect = size === "lg" ? "aspect-[4/3]" : size === "md" ? "aspect-square" : "aspect-[4/3]";
  const cols   = size === "sm" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="flex flex-col gap-2">
      <div className={`grid ${cols} gap-2.5`}>
        {cards.map((c) => {
          const isSel = selected.includes(c.hex);
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => onToggle(c.hex)}
              className={cn(
                "group relative rounded-2xl overflow-hidden border-2 transition-all text-left active:scale-[0.97]",
                isSel
                  ? "border-forest shadow-lg"
                  : "border-transparent hover:border-forest/30 hover:shadow-sm",
              )}
            >
              {/* Swatch */}
              <div
                className={`relative ${aspect} w-full`}
                style={{ background: `linear-gradient(135deg, ${c.hex} 0%, ${shade(c.hex, -0.18)} 100%)` }}
              >
                {/* Golden selected ring */}
                {isSel && (
                  <div className="absolute inset-1.5 rounded-xl ring-2 ring-[#d4a84b] pointer-events-none" />
                )}
                {isSel && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#d4a84b] flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              {/* Meta */}
              <div className={cn(
                "px-2.5 py-1.5 transition-colors",
                isSel ? "bg-forest text-white" : "bg-white"
              )}>
                <p className={cn(
                  "text-[13px] font-semibold leading-tight",
                  isSel ? "text-white" : "text-forest"
                )}>
                  {c.name}
                </p>
                <p className={cn(
                  "text-[10px] leading-tight",
                  isSel ? "text-white/70" : "text-gray/55"
                )}>
                  {c.mood}
                </p>
              </div>
            </button>
          );
        })}

        {/* Custom color tile */}
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className={cn(
            "rounded-2xl border-2 border-dashed border-sand/50 bg-cream/60 hover:border-forest/40 hover:bg-cream flex items-center justify-center gap-1.5 text-xs text-forest/60 font-sans transition-colors",
            aspect
          )}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Eigene Farbe
        </button>
      </div>

      {customOpen && (
        <div className="rounded-xl border border-sand/40 bg-white p-3 flex items-center gap-3">
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-forest/20"
          />
          <input
            type="text"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            placeholder="#rrggbb"
            className="flex-1 h-9 px-3 rounded border border-sand/40 text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => { customChanger(customHex); setCustomOpen(false); }}
            className="h-9 px-4 rounded bg-forest text-white text-xs font-medium hover:bg-forest/90"
          >
            Übernehmen
          </button>
        </div>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const i = parseInt(n, 16);
  return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function shade(hex: string, amount: number): string {
  try {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + 255 * amount, g + 255 * amount, b + 255 * amount);
  } catch { return hex; }
}
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function deriveHarmonyNote(primary: string[], secondary: string[], accent: string): string | null {
  if (primary.length === 0 && secondary.length === 0 && !accent) return null;
  const all = [...primary, ...secondary, accent].filter(Boolean);
  if (all.length < 2) return "Basis gewählt";
  const lumas   = all.map(luminance);
  const range   = Math.max(...lumas) - Math.min(...lumas);
  if (range < 0.15) return "Harmonische Ton-in-Ton Palette";
  if (range < 0.35) return "Ausgewogene Kombination";
  return "Mutiger Kontrast";
}
