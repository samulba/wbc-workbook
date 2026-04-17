"use client";

import { cn } from "@/lib/utils";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import {
  Lightbulb, Flame, Sun, Heart, Sparkles, Palette, BookOpen, Leaf,
  Frame, Image as ImageIcon, Coffee, Music, Armchair, Clock, Plus,
} from "lucide-react";
import { useMemo } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { ProductRecommendations } from "../ProductRecommendations";

interface Props {
  data: Module1Data;
  roomType: string;
  roomName: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

// ── Light presets ───────────────────────────────────────────────────────────

type LightPreset = {
  value:      string;
  label:      string;
  desc:       string;
  warmth:     number;    // 0 cold … 100 warm
  brightness: number;    // 0 dim … 100 bright
  Icon:       React.ElementType;
};

const LIGHT_PRESETS: LightPreset[] = [
  { value: "gemuetlicher_abend", label: "Gemütlicher Abend", desc: "Warm · stark gedimmt",
    warmth: 90, brightness: 30, Icon: Flame },
  { value: "produktiver_morgen", label: "Produktiver Morgen", desc: "Neutral · hell",
    warmth: 55, brightness: 85, Icon: Sun },
  { value: "romantisches_dinner", label: "Romantisches Dinner", desc: "Sehr warm · sanft",
    warmth: 95, brightness: 20, Icon: Heart },
  { value: "fokus_arbeit", label: "Fokus-Arbeit", desc: "Kühl · sehr hell",
    warmth: 25, brightness: 95, Icon: Lightbulb },
];

// Map warmth/brightness → a CSS gradient-ish "room lighting" preview color
function lightPreviewCss(warmth: number, brightness: number) {
  // Warmth 0..100 → hue in kelvin-ish range
  const hueColdToWarm = [
    { w:   0, rgb: [166, 202, 222] }, // cool blue-white
    { w:  50, rgb: [245, 240, 225] }, // neutral cream
    { w: 100, rgb: [255, 200, 140] }, // warm amber
  ];
  let c1 = hueColdToWarm[0], c2 = hueColdToWarm[1];
  if (warmth >= 50) { c1 = hueColdToWarm[1]; c2 = hueColdToWarm[2]; }
  const t   = warmth >= 50 ? (warmth - 50) / 50 : warmth / 50;
  const rgb = c1.rgb.map((v, i) => Math.round(v + (c2.rgb[i] - v) * t));

  const bLuma   = brightness / 100;
  const overlay = 1 - bLuma;

  // bg main color
  const main = `rgb(${rgb.join(",")})`;
  // darker edge
  const shade = `rgba(0,0,0,${0.15 + overlay * 0.45})`;

  return {
    background:
      `radial-gradient(ellipse at 50% 30%, ${main} 0%, ${shade} 90%)`,
    overlay: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,${overlay * 0.35}) 100%)`,
  };
}

// ── Special-element ideas ───────────────────────────────────────────────────

type IdeaCard = {
  value:  string;
  label:  string;
  hint:   string;
  Icon:   React.ElementType;
};

const IDEAS: IdeaCard[] = [
  { value: "statement_wand",  label: "Statement-Wand",   hint: "Farbe, Tapete oder Bild als Highlight", Icon: Palette },
  { value: "pflanzen_ecke",   label: "Pflanzen-Ecke",    hint: "Grüne Inseln für Lebendigkeit",         Icon: Leaf },
  { value: "kunst_galerie",   label: "Kunst-Galerie",    hint: "Bilder in einer Komposition",           Icon: Frame },
  { value: "leseecke",        label: "Leseecke",         hint: "Sessel, Licht, Bücher",                 Icon: BookOpen },
  { value: "galerie_wand",    label: "Bilder-Wand",      hint: "Erinnerungen & Prints",                 Icon: ImageIcon },
  { value: "musik_ecke",      label: "Musik-Ecke",       hint: "Platz für Plattenspieler / Instrument", Icon: Music },
  { value: "kaffee_station",  label: "Kaffee-Station",   hint: "Kleine Bar für Rituale",                Icon: Coffee },
  { value: "gemuetliche_bank",label: "Gemütliche Bank",  hint: "Fensterplatz oder Flur-Bank",           Icon: Armchair },
  { value: "erinnerungsregal",label: "Erinnerungsregal", hint: "Kuratierte Objekte",                    Icon: Clock },
  { value: "abend_ritual",    label: "Abend-Ritual",     hint: "Kerzen, Diffuser, Textilien",           Icon: Flame },
  { value: "kreativ_tisch",   label: "Kreativ-Tisch",    hint: "Platz zum Werkeln",                     Icon: Sparkles },
];

// ── Small helpers ───────────────────────────────────────────────────────────

function ColorDot({ value }: { value: string }) {
  const isHex = /^#[0-9a-fA-F]{3,6}$/.test(value);
  if (!value.trim()) {
    return <span className="w-6 h-6 rounded-full border-2 border-dashed border-sand/40 bg-cream/50 shrink-0" />;
  }
  return (
    <span
      className="w-6 h-6 rounded-full border border-sand/30 shadow-sm shrink-0"
      style={{ backgroundColor: isHex ? value : "#e5e0d5" }}
      title={value}
    />
  );
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-sand/20 last:border-0">
      <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-sand">{label}</span>
      {children}
    </div>
  );
}

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

// ── Main ────────────────────────────────────────────────────────────────────

export function Step08({ data, roomType, roomName, onChange }: Props) {
  const effect     = data.main_effect as RoomEffect | null;
  const effectMeta = EFFECTS.find((e) => e.value === effect);

  const primary   = (data.primary_colors   ?? []) as string[];
  const secondary = (data.secondary_colors ?? []) as string[];
  const accent    = data.accent_color ?? "";
  const materials = data.materials ?? [];
  const specialTags = data.special_tags ?? [];

  // Light state: pull from DB or fallback to a preset's numbers
  const warmth     = data.light_warmth     ?? 50;
  const brightness = data.light_brightness ?? 60;
  const selectedPreset = LIGHT_PRESETS.find((p) => p.value === data.light_mood);

  const preview = useMemo(
    () => lightPreviewCss(warmth, brightness),
    [warmth, brightness],
  );

  function pickPreset(p: LightPreset) {
    onChange({
      light_mood:       p.value,
      light_warmth:     p.warmth,
      light_brightness: p.brightness,
    });
  }
  function setWarmth(v: number) {
    onChange({ light_warmth: v, light_mood: "" });
  }
  function setBrightness(v: number) {
    onChange({ light_brightness: v, light_mood: "" });
  }

  function toggleIdea(value: string) {
    const has = specialTags.includes(value);
    onChange({
      special_tags: has ? specialTags.filter((t) => t !== value) : [...specialTags, value],
    });
  }

  return (
    <div className="flex flex-col gap-10">

      {/* ── Summary card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-sand/30 bg-white/50 overflow-hidden">
        <div className="bg-forest/5 border-b border-sand/20 px-5 py-3 flex items-center gap-2">
          <span className="font-headline text-sm text-forest">Dein Raum-Überblick</span>
          <span className="text-xs text-gray/40 font-sans ml-auto">automatisch ausgefüllt</span>
        </div>
        <div className="px-5">
          <SummarySection label="Raum">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-lg text-forest">{roomName}</span>
              {roomType && <span className="text-sm text-gray/50 font-sans">{ROOM_LABELS[roomType] ?? roomType}</span>}
            </div>
          </SummarySection>

          <SummarySection label="Hauptwirkung">
            {effectMeta ? (
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${effectMeta.infoBg} border ${effectMeta.infoBorder} flex items-center justify-center`}>
                  <effectMeta.Icon className={`w-3.5 h-3.5 ${effectMeta.infoIconColor}`} strokeWidth={1.5} />
                </div>
                <span className="font-sans text-sm font-medium text-forest">
                  {effectMeta.label}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray/40 font-sans italic">Noch nicht ausgewählt</span>
            )}
          </SummarySection>

          <SummarySection label="Farbwelt">
            {primary.length || secondary.length || accent ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray/40 font-sans w-20">Primär</span>
                  <div className="flex gap-1.5">
                    {primary.length ? primary.map((c, i) => <ColorDot key={i} value={c} />) : <ColorDot value="" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray/40 font-sans w-20">Sekundär</span>
                  <div className="flex gap-1.5">
                    {secondary.length ? secondary.map((c, i) => <ColorDot key={i} value={c} />) : <ColorDot value="" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray/40 font-sans w-20">Akzent</span>
                  <ColorDot value={accent} />
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray/40 font-sans italic">Noch nicht definiert</span>
            )}
          </SummarySection>

          <SummarySection label="Materialien">
            {materials.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <span key={m} className="text-xs font-sans font-medium text-forest/70 bg-forest/5 border border-forest/10 px-2.5 py-1 rounded-full">
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray/40 font-sans italic">Noch nicht gewählt</span>
            )}
          </SummarySection>
        </div>
      </div>

      {/* ── LICHT: Simulator + Presets ───────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-sand" strokeWidth={1.5} />
          <h3 className="font-headline text-xl text-forest">Lichtstimmung</h3>
        </div>

        {/* Preview panel */}
        <div
          className="relative rounded-2xl overflow-hidden ring-1 ring-forest/10 shadow-lg transition-all duration-500"
          style={{
            aspectRatio:   "16/9",
            background:    preview.background,
          }}
        >
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{ background: preview.overlay }}
          />
          <div className="absolute inset-0 flex items-end p-5">
            <div className="flex items-center gap-2 text-white/90 text-xs font-sans">
              <div className="w-2.5 h-2.5 rounded-full bg-white/80 shadow" />
              <span>
                {warmth < 35 ? "Kühl" : warmth > 65 ? "Warm" : "Neutral"}
                {" · "}
                {brightness < 35 ? "Gedimmt" : brightness > 70 ? "Hell" : "Sanft"}
              </span>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-2 gap-4">
          <LabeledSlider
            label="Kalt ←→ Warm"
            value={warmth}
            onChange={setWarmth}
            trackGradient="linear-gradient(90deg, #a6cade 0%, #f5f0e1 50%, #ffc88c 100%)"
          />
          <LabeledSlider
            label="Gedimmt ←→ Hell"
            value={brightness}
            onChange={setBrightness}
            trackGradient="linear-gradient(90deg, #2a2a2a 0%, #a89e86 50%, #fdf6e3 100%)"
          />
        </div>

        {/* Preset cards */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
            Presets zum schnellen Start
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {LIGHT_PRESETS.map((p) => {
              const isSel = selectedPreset?.value === p.value;
              const cfg   = lightPreviewCss(p.warmth, p.brightness);
              const Icon  = p.Icon;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => pickPreset(p)}
                  className={cn(
                    "group rounded-2xl overflow-hidden border-2 text-left transition-all active:scale-[0.97]",
                    isSel
                      ? "border-forest ring-2 ring-mint/40 shadow-md"
                      : "border-transparent hover:border-forest/30 hover:shadow-sm",
                  )}
                >
                  <div
                    className="relative aspect-[4/3] flex items-center justify-center"
                    style={{ background: cfg.background }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: cfg.overlay }}
                    />
                    <Icon className="relative w-6 h-6 text-white drop-shadow" strokeWidth={1.5} />
                  </div>
                  <div className={cn("px-2.5 py-1.5", isSel ? "bg-forest text-white" : "bg-white")}>
                    <p className={cn("text-[13px] font-semibold leading-tight", isSel ? "text-white" : "text-forest")}>
                      {p.label}
                    </p>
                    <p className={cn("text-[10px] leading-tight", isSel ? "text-white/70" : "text-gray/55")}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BESONDERE ELEMENTE: Idea cards ─────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Was darf nicht fehlen?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Tippe auf alles, was in deinen Raum gehört. Mehrfachauswahl möglich.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {IDEAS.map((i) => {
            const isSel = specialTags.includes(i.value);
            const Icon  = i.Icon;
            return (
              <button
                key={i.value}
                type="button"
                onClick={() => toggleIdea(i.value)}
                className={cn(
                  "relative rounded-2xl border p-4 text-left transition-all active:scale-[0.97] group",
                  isSel
                    ? "border-forest bg-forest/5 ring-2 ring-mint/30"
                    : "border-sand/40 bg-white hover:border-forest/30 hover:bg-mint/5",
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors",
                  isSel ? "bg-forest/15" : "bg-sand/15 group-hover:bg-mint/20",
                )}>
                  <Icon className={cn("w-4 h-4", isSel ? "text-forest" : "text-forest/50")} strokeWidth={1.5} />
                </div>
                <p className={cn("text-sm font-semibold leading-tight", isSel ? "text-forest" : "text-forest/70")}>
                  {i.label}
                </p>
                <p className="text-[11px] text-gray/50 leading-snug mt-0.5">{i.hint}</p>
                {isSel && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-forest flex items-center justify-center">
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 stroke-white" strokeWidth="2.5" fill="none">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Free-form addendum */}
        <div className="mt-2">
          <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
            Eigene Notizen
          </p>
          <Textarea
            placeholder="z. B. Mein Klavier, Omas Kommode, die Kakteensammlung …"
            value={data.special_elements ?? ""}
            onChange={(e) => onChange({ special_elements: e.target.value })}
            rows={3}
            hint="Persönliche Gegenstände, die deinen Raum zu deinem machen."
          />
        </div>
      </section>

      {/* Product recommendations */}
      <ProductRecommendations
        roomType={roomType}
        mainEffect={data.main_effect}
        roomId={data.room_id ?? null}
        heading="Empfehlungen für dein Konzept"
      />

      {/* Prevent unused-import warning for a Lucide icon we might want later */}
      <span className="hidden"><Plus /></span>
    </div>
  );
}

// ── Labeled slider ──────────────────────────────────────────────────────────

function LabeledSlider({
  label, value, onChange, trackGradient,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  trackGradient: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-sans text-forest/70">{label}</label>
        <span className="text-xs font-mono text-forest/50 tabular-nums">{value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute left-0 right-0 h-3 rounded-full border border-forest/10"
          style={{ background: trackGradient }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-6 bg-transparent appearance-none cursor-pointer wbc-slider"
        />
      </div>
      <style jsx>{`
        .wbc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #445c49;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: grab;
        }
        .wbc-slider:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.08); }
        .wbc-slider::-moz-range-thumb {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #445c49;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: grab;
        }
      `}</style>
    </div>
  );
}
