"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/Textarea";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import { Lightbulb, Sun, Sunset, ToggleLeft } from "lucide-react";
import { ProductRecommendations } from "../ProductRecommendations";

interface Props {
  data: Module1Data;
  roomType: string;
  roomName: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const LIGHT_OPTIONS = [
  {
    value: "warm_indirekt",
    label: "Warm & indirekt",
    description: "Stimmungsvolle Atmosphäre, sanfte Schatten, entspannend",
    Icon: Sunset,
  },
  {
    value: "hell_klar",
    label: "Hell & klar",
    description: "Gleichmäßig beleuchtet, funktional, aktivierend",
    Icon: Sun,
  },
  {
    value: "beides_steuerbar",
    label: "Beides – steuerbar",
    description: "Flexibles Lichtsystem für verschiedene Situationen und Stimmungen",
    Icon: ToggleLeft,
  },
];

function ColorDot({ value }: { value: string }) {
  const isHex = /^#[0-9a-fA-F]{3,6}$/.test(value);
  if (!value.trim()) {
    return (
      <span className="w-6 h-6 rounded-full border-2 border-dashed border-sand/40 bg-cream/50 shrink-0" />
    );
  }
  return (
    <span
      className="w-6 h-6 rounded-full border border-sand/30 shadow-sm shrink-0"
      style={{ backgroundColor: isHex ? value : undefined }}
      title={value}
    >
      {!isHex && (
        <span className="w-full h-full flex items-center justify-center text-[8px] text-gray/50 leading-none">
          ?
        </span>
      )}
    </span>
  );
}

function SummarySection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-sand/20 last:border-0">
      <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-sand">
        {label}
      </span>
      {children}
    </div>
  );
}

export function Step08({ data, roomType, roomName, onChange }: Props) {
  const effect     = data.main_effect as RoomEffect | null;
  const effectMeta = EFFECTS.find((e) => e.value === effect);

  const primary   = (data.primary_colors   ?? []) as string[];
  const secondary = (data.secondary_colors ?? []) as string[];
  const accent    = data.accent_color ?? "";
  const materials = data.materials ?? [];
  const lightMood = data.light_mood ?? "";

  return (
    <div className="flex flex-col gap-8">

      {/* ── Summary card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-sand/30 bg-white/50 overflow-hidden">
        {/* Card header */}
        <div className="bg-forest/5 border-b border-sand/20 px-5 py-3 flex items-center gap-2">
          <span className="font-headline text-sm text-forest">Dein Raum-Überblick</span>
          <span className="text-xs text-gray/40 font-sans ml-auto">wird automatisch ausgefüllt</span>
        </div>

        <div className="px-5">
          {/* Raum */}
          <SummarySection label="Raum">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-lg text-forest">{roomName}</span>
              {roomType && (
                <span className="text-sm text-gray/50 font-sans">
                  {ROOM_LABELS[roomType] ?? roomType}
                </span>
              )}
            </div>
          </SummarySection>

          {/* Hauptwirkung */}
          <SummarySection label="Hauptwirkung">
            {effectMeta ? (
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${effectMeta.infoBg} border ${effectMeta.infoBorder} flex items-center justify-center`}>
                  <effectMeta.Icon
                    className={`w-3.5 h-3.5 ${effectMeta.infoIconColor}`}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="font-sans text-sm font-medium text-forest">
                  {effectMeta.label}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray/40 font-sans italic">
                Noch nicht ausgewählt (Schritt 4)
              </span>
            )}
          </SummarySection>

          {/* Farbwelt */}
          <SummarySection label="Farbwelt">
            {primary[0] || primary[1] || secondary[0] || secondary[1] || accent ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray/40 font-sans w-20">Primär</span>
                  <div className="flex gap-1.5">
                    <ColorDot value={primary[0] ?? ""} />
                    <ColorDot value={primary[1] ?? ""} />
                  </div>
                  <span className="text-xs text-gray/35 font-mono">
                    {[primary[0], primary[1]].filter(Boolean).join("  ·  ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray/40 font-sans w-20">Sekundär</span>
                  <div className="flex gap-1.5">
                    <ColorDot value={secondary[0] ?? ""} />
                    <ColorDot value={secondary[1] ?? ""} />
                  </div>
                  <span className="text-xs text-gray/35 font-mono">
                    {[secondary[0], secondary[1]].filter(Boolean).join("  ·  ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray/40 font-sans w-20">Akzent</span>
                  <ColorDot value={accent} />
                  <span className="text-xs text-gray/35 font-mono">{accent}</span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray/40 font-sans italic">
                Noch nicht definiert (Schritt 6)
              </span>
            )}
          </SummarySection>

          {/* Materialien */}
          <SummarySection label="Materialien">
            {materials.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-sans font-medium text-forest/70 bg-forest/5 border border-forest/10 px-2.5 py-1 rounded-full"
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray/40 font-sans italic">
                Noch nicht gewählt (Schritt 6)
              </span>
            )}
          </SummarySection>
        </div>
      </div>

      {/* ── Lichtstimmung ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-sand" strokeWidth={1.5} />
          <h3 className="font-headline text-xl text-forest">Lichtstimmung</h3>
        </div>

        <div className="flex flex-col gap-2">
          {LIGHT_OPTIONS.map(({ value, label, description, Icon }) => {
            const selected = lightMood === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ light_mood: value })}
                className={cn(
                  "w-full text-left rounded-xl border-2 px-4 py-3.5 flex items-start gap-3 transition-all",
                  selected
                    ? "border-forest bg-forest/5"
                    : "border-sand/40 bg-cream hover:border-mint/60 hover:bg-mint/5"
                )}
              >
                {/* Radio dot */}
                <span className={cn(
                  "mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                  selected ? "border-forest" : "border-sand/60"
                )}>
                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-forest" />}
                </span>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                      "text-sm font-sans font-semibold transition-colors",
                      selected ? "text-forest" : "text-forest/60"
                    )}>
                      {label}
                    </span>
                    <Icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", selected ? "text-forest/60" : "text-gray/30")} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-gray/50 font-sans leading-relaxed">
                    {description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Besondere Elemente ────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h3 className="font-headline text-xl text-forest">
          Was darf nicht fehlen?
        </h3>
        <Textarea
          placeholder="z. B. Pflanzen, ein großer Spiegel, meine Yogamatte, ein offenes Regal für Bücher …"
          value={data.special_elements ?? ""}
          onChange={(e) => onChange({ special_elements: e.target.value })}
          rows={3}
          hint="Besondere Objekte, die deinen Raum zu deinem machen."
        />
      </div>

      {/* Product recommendations */}
      <ProductRecommendations
        roomType={roomType}
        mainEffect={data.main_effect}
        roomId={data.room_id ?? null}
        heading="Empfehlungen für dein Konzept"
      />

    </div>
  );
}
