"use client";

import { useState } from "react";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Module1Data } from "@/lib/types/module1";
import { ProductRecommendations } from "../ProductRecommendations";

interface Props {
  data:     Module1Data;
  roomType: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

const MATERIAL_OPTIONS = [
  { value: "holz",      label: "Holz",      emoji: "🪵" },
  { value: "leinen",    label: "Leinen",    emoji: "🧵" },
  { value: "stein",     label: "Stein",     emoji: "🪨" },
  { value: "metall",    label: "Metall",    emoji: "⚙️" },
  { value: "glas",      label: "Glas",      emoji: "🪟" },
  { value: "textilien", label: "Textilien", emoji: "🛋️" },
  { value: "sonstiges", label: "Sonstiges", emoji: "✏️" },
];

export function Step06({ data, roomType, onChange }: Props) {
  const primary   = (data.primary_colors   ?? ["", ""]) as [string, string];
  const secondary = (data.secondary_colors ?? ["", ""]) as [string, string];
  const accent    = data.accent_color ?? "";
  const materials = data.materials ?? [];

  const [customMaterial, setCustomMaterial] = useState(
    materials.find((m) => !MATERIAL_OPTIONS.some((o) => o.value === m)) ?? ""
  );

  function setColor(
    group: "primary_colors" | "secondary_colors",
    index: 0 | 1,
    value: string
  ) {
    const current = (
      group === "primary_colors" ? primary : secondary
    ) as [string, string];
    const next: [string, string] = [...current] as [string, string];
    next[index] = value;
    onChange({ [group]: next });
  }

  function toggleMaterial(value: string) {
    if (value === "sonstiges") {
      // Toggle sonstiges: add/remove current customMaterial
      const custom = customMaterial.trim();
      if (!custom) {
        // Just toggle "sonstiges" flag without custom text
        const hasIt = materials.includes("sonstiges");
        onChange({
          materials: hasIt
            ? materials.filter((m) => m !== "sonstiges")
            : [...materials, "sonstiges"],
        });
        return;
      }
      const hasCustom = materials.includes(custom);
      onChange({
        materials: hasCustom
          ? materials.filter((m) => m !== custom && m !== "sonstiges")
          : [...materials.filter((m) => m !== "sonstiges"), custom],
      });
      return;
    }

    const hasIt = materials.includes(value);
    onChange({
      materials: hasIt ? materials.filter((m) => m !== value) : [...materials, value],
    });
  }

  function isChecked(option: typeof MATERIAL_OPTIONS[number]) {
    if (option.value === "sonstiges") {
      // checked if any material is not in predefined list
      return materials.some(
        (m) => !MATERIAL_OPTIONS.slice(0, -1).some((o) => o.value === m)
      );
    }
    return materials.includes(option.value);
  }

  function handleCustomMaterialChange(value: string) {
    setCustomMaterial(value);
    // Replace old custom value in materials
    const oldCustom = materials.find(
      (m) => !MATERIAL_OPTIONS.slice(0, -1).some((o) => o.value === m)
    );
    if (oldCustom !== undefined || value.trim()) {
      onChange({
        materials: [
          ...materials.filter((m) =>
            MATERIAL_OPTIONS.slice(0, -1).some((o) => o.value === m)
          ),
          ...(value.trim() ? [value.trim()] : []),
        ],
      });
    }
  }

  const hasSonstiges = isChecked(MATERIAL_OPTIONS[MATERIAL_OPTIONS.length - 1]);

  return (
    <div className="flex flex-col gap-10">

      {/* ── Primärfarben ────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-10 rounded-full bg-forest/60 shrink-0" />
          <div>
            <h3 className="font-headline text-lg text-forest leading-snug">
              Primärfarben
            </h3>
            <p className="text-xs text-gray/50 font-sans">
              Basis · 60 % · Wände & Boden
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorSwatch
            label="Primärfarbe 1"
            value={primary[0]}
            onChange={(v) => setColor("primary_colors", 0, v)}
          />
          <ColorSwatch
            label="Primärfarbe 2"
            value={primary[1]}
            onChange={(v) => setColor("primary_colors", 1, v)}
          />
        </div>
      </section>

      {/* ── Sekundärfarben ──────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 rounded-full bg-mint/70 shrink-0" />
          <div>
            <h3 className="font-headline text-lg text-forest leading-snug">
              Sekundärfarben
            </h3>
            <p className="text-xs text-gray/50 font-sans">
              Verstärkung · 30 % · Möbel & Textilien
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorSwatch
            label="Sekundärfarbe 1"
            value={secondary[0]}
            onChange={(v) => setColor("secondary_colors", 0, v)}
          />
          <ColorSwatch
            label="Sekundärfarbe 2"
            value={secondary[1]}
            onChange={(v) => setColor("secondary_colors", 1, v)}
          />
        </div>
      </section>

      {/* ── Akzentfarbe ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-5 rounded-full bg-terracotta/70 shrink-0" />
          <div>
            <h3 className="font-headline text-lg text-forest leading-snug">
              Akzentfarbe
            </h3>
            <p className="text-xs text-gray/50 font-sans">
              Energie · 10 % · Deko & Details
            </p>
          </div>
        </div>
        <div className="max-w-xs">
          <ColorSwatch
            label="Akzentfarbe"
            value={accent}
            onChange={(v) => onChange({ accent_color: v })}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-sand/30" />
        <span className="text-xs text-gray/40 font-sans uppercase tracking-widest">
          Materialien
        </span>
        <div className="flex-1 h-px bg-sand/30" />
      </div>

      {/* ── Materialien ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-lg text-forest mb-1">
            Welche Materialien sprechen dich an?
          </h3>
          <p className="text-sm text-gray/55 font-sans">
            Mehrere Auswahlen möglich.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {MATERIAL_OPTIONS.map((option) => {
            const checked = isChecked(option);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleMaterial(option.value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                  checked
                    ? "border-forest bg-forest/5"
                    : "border-sand/40 bg-cream hover:border-mint/60 hover:bg-mint/5"
                )}
              >
                <span className="text-base leading-none">{option.emoji}</span>
                <span className={cn(
                  "text-sm font-sans font-medium transition-colors",
                  checked ? "text-forest" : "text-forest/60"
                )}>
                  {option.label}
                </span>
                {checked && (
                  <span className="ml-auto">
                    <svg viewBox="0 0 10 8" className="w-3 h-2.5 fill-none stroke-forest stroke-[2.5]">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom material input when Sonstiges is active */}
        {hasSonstiges && (
          <div className="mt-1">
            <Input
              placeholder="Welches Material? z. B. Rattan, Bambus, Kork …"
              value={customMaterial}
              onChange={(e) => handleCustomMaterialChange(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </section>

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
