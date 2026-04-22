"use client";

import { Flame, Sunrise, Sun, Moon, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module3Data, LightPreset } from "@/lib/types/module3";
import { lightPreviewCss } from "../lightPreview";

type PresetConfig = {
  value:      LightPreset;
  label:      string;
  desc:       string;
  warmth:     number;
  brightness: number;
  Icon:       React.ElementType;
};

const PRESETS: PresetConfig[] = [
  { value: "kaminfeuer",    label: "Kaminfeuer",       desc: "Sehr warm · stark gedimmt", warmth: 95, brightness: 25, Icon: Flame },
  { value: "sonnenaufgang", label: "Sonnenaufgang",    desc: "Warm · mittlere Helligkeit", warmth: 75, brightness: 65, Icon: Sunrise },
  { value: "tageslicht",    label: "Tageslicht",       desc: "Neutral · sehr hell",        warmth: 45, brightness: 95, Icon: Sun },
  { value: "abendstimmung", label: "Abendstimmung",    desc: "Warm · sanft",               warmth: 85, brightness: 45, Icon: Moon },
  { value: "custom",        label: "Eigene Stimmung",  desc: "Sliders im nächsten Schritt", warmth: 60, brightness: 60, Icon: Sliders },
];

interface Props {
  data:     Module3Data;
  onChange: (patch: Partial<Module3Data>) => void;
}

export function Step04({ data, onChange }: Props) {
  const selected = data.preset;

  function pick(p: PresetConfig) {
    onChange({
      preset:           p.value,
      light_mood:       p.value,
      light_warmth:     p.warmth,
      light_brightness: p.brightness,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray/60 font-sans">
        Welches Licht passt zu deinem Raum? Wähle einen Startpunkt – im nächsten Schritt kannst du fein justieren.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PRESETS.map((p) => {
          const isSel = selected === p.value;
          const cfg   = lightPreviewCss(p.warmth, p.brightness);
          const Icon  = p.Icon;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => pick(p)}
              className={cn(
                "group rounded-2xl overflow-hidden border-2 text-left transition-all active:scale-[0.97]",
                isSel ? "border-forest ring-2 ring-mint/40 shadow-md" : "border-transparent hover:border-forest/30 hover:shadow-sm",
              )}
            >
              <div className="relative aspect-[4/3] flex items-center justify-center" style={{ background: cfg.background }}>
                <div className="absolute inset-0" style={{ background: cfg.overlay }} />
                <Icon className="relative w-7 h-7 text-white drop-shadow" strokeWidth={1.5} />
              </div>
              <div className={cn("px-3 py-2", isSel ? "bg-forest text-white" : "bg-white")}>
                <p className={cn("text-sm font-semibold leading-tight", isSel ? "text-white" : "text-forest")}>
                  {p.label}
                </p>
                <p className={cn("text-[11px] leading-tight mt-0.5", isSel ? "text-white/70" : "text-gray/55")}>
                  {p.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
