"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import {
  CheckCircle2,
  Download,
  Lock,
  Lightbulb,
  Palette,
  Layers,
  Ruler,
  Leaf,
} from "lucide-react";

interface Props {
  data: Module1Data;
  projectName: string;
  roomType: string;
  roomName: string;
}

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const LIGHT_LABELS: Record<string, string> = {
  warm_indirekt:    "Warm & indirekt",
  hell_klar:        "Hell & klar",
  beides_steuerbar: "Beides – steuerbar",
};

const TIPS = [
  {
    Icon: Palette,
    title: "Farbprobe zuerst",
    text: "Teste Wandfarben auf einem A3-Karton – bei Tageslicht und abends im Kunstlicht. Farben wirken in groß anders als auf der Karte.",
  },
  {
    Icon: Layers,
    title: "Starte mit dem Boden",
    text: "Der Boden prägt den ganzen Raum. Entscheide dich zuerst für Bodenbelag oder Teppich, dann wähle Möbel und Farben dazu.",
  },
  {
    Icon: Ruler,
    title: "Maße vor dem Kauf",
    text: "Kaufe zuerst das wichtigste Möbelstück. Miss den Raum aus und klebe die Grundfläche mit Malerkrepp ab – so erkennst du das richtige Verhältnis.",
  },
  {
    Icon: Leaf,
    title: "Weniger, aber bewusst",
    text: "Lieber ein starkes Statement-Möbel als viele kleine Objekte. Lass mindestens 30 % der Flächen frei – das schafft Ruhe und Eleganz.",
  },
];

// Confetti-like decorative dots
const DOTS = [
  { left: "6%",  top: "18%", size: "w-3 h-3",   color: "bg-mint/50",       delay: "0s"    },
  { left: "88%", top: "12%", size: "w-2 h-2",   color: "bg-terracotta/50", delay: "0.6s"  },
  { left: "18%", top: "8%",  size: "w-2.5 h-2.5", color: "bg-sand/70",     delay: "1.2s"  },
  { left: "78%", top: "28%", size: "w-2 h-2",   color: "bg-forest/30",     delay: "0.9s"  },
  { left: "92%", top: "55%", size: "w-3 h-3",   color: "bg-mint/40",       delay: "0.3s"  },
  { left: "4%",  top: "65%", size: "w-2 h-2",   color: "bg-sand/50",       delay: "1.5s"  },
];

export function Step11({ data, projectName, roomType, roomName }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const effect     = data.main_effect as RoomEffect | null;
  const effectMeta = effect ? EFFECTS.find((e) => e.value === effect) : null;
  const primary    = (data.primary_colors   ?? []).filter(Boolean) as string[];
  const secondary  = (data.secondary_colors ?? []).filter(Boolean) as string[];
  const accent     = data.accent_color?.trim() ?? "";
  const allColors  = [...primary, ...secondary, accent].filter(Boolean);
  const materials  = data.materials ?? [];
  const lightMood  = LIGHT_LABELS[data.light_mood ?? ""] ?? "";
  const moodboardUrl = (data.moodboard_urls ?? [])[0] ?? "";
  const isImageUrl = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(moodboardUrl);

  return (
    <div className="flex flex-col gap-10">

      {/* ── Celebration hero ──────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-forest to-forest/80 px-6 py-10 text-center">
        {/* Decorative dots */}
        {DOTS.map((d, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute rounded-full animate-pulse pointer-events-none",
              d.size,
              d.color
            )}
            style={{
              left: d.left,
              top: d.top,
              animationDelay: d.delay,
              animationDuration: "2.5s",
            }}
          />
        ))}

        {/* Checkmark */}
        <div className="flex justify-center mb-5">
          <div
            className={cn(
              "w-20 h-20 rounded-full bg-white/15 border-2 border-white/30",
              "flex items-center justify-center transition-all duration-500",
              mounted ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5 9-9" />
            </svg>
          </div>
        </div>

        <h2
          className={cn(
            "font-headline text-3xl text-white mb-2 transition-all duration-500 delay-150",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
          {projectName}
        </h2>
        <p
          className={cn(
            "font-sans text-sm text-white/65 transition-all duration-500 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
          {roomName} · {ROOM_LABELS[roomType] ?? roomType}
        </p>

        {/* Status badge */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 mt-5 bg-white/20 border border-white/30 rounded-full px-3.5 py-1.5",
            "transition-all duration-500 delay-300",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-mint" strokeWidth={2} />
          <span className="text-xs font-sans font-semibold text-white uppercase tracking-widest">
            Modul 1 abgeschlossen
          </span>
        </div>
      </div>

      {/* ── Summary card ──────────────────────────────────── */}
      <div className="rounded-2xl border border-sand/30 bg-white/50 overflow-hidden">
        <div className="bg-forest/5 border-b border-sand/20 px-5 py-3">
          <span className="font-headline text-sm text-forest">Dein Raumkonzept im Überblick</span>
        </div>

        <div className="divide-y divide-sand/15">

          {/* Hauptwirkung */}
          {effectMeta && (
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
                <effectMeta.Icon className="w-4.5 h-4.5 text-forest/60" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-0.5">
                  Hauptwirkung
                </p>
                <p className="text-sm font-sans font-semibold text-forest">{effectMeta.label}</p>
              </div>
            </div>
          )}

          {/* Farbwelt */}
          {allColors.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-2.5">
                Farbwelt
              </p>
              <div className="flex gap-2 flex-wrap">
                {allColors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className="w-8 h-8 rounded-full border border-sand/30 shadow-sm"
                      style={{
                        backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : undefined,
                        background: /^#[0-9a-fA-F]{3,6}$/.test(c) ? undefined : "#cba17840",
                      }}
                      title={c}
                    />
                    <span className="text-[9px] font-mono text-gray/35 max-w-[40px] truncate">
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materialien */}
          {materials.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-2.5">
                Materialien
              </p>
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
            </div>
          )}

          {/* Lichtstimmung */}
          {lightMood && (
            <div className="px-5 py-4 flex items-center gap-3">
              <Lightbulb className="w-4 h-4 text-sand shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-0.5">
                  Lichtstimmung
                </p>
                <p className="text-sm font-sans font-medium text-forest">{lightMood}</p>
              </div>
            </div>
          )}

          {/* Moodboard preview */}
          {isImageUrl && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-2.5">
                Moodboard
              </p>
              <div className="rounded-xl overflow-hidden border border-sand/30 aspect-video bg-sand/5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={moodboardUrl}
                  alt="Moodboard"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tips box ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-sand/30 bg-sand/8 overflow-hidden">
        <div className="border-b border-sand/20 px-5 py-3 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-sand" strokeWidth={1.5} />
          <span className="font-headline text-sm text-forest/80">4 Tipps für die Umsetzung</span>
        </div>
        <div className="divide-y divide-sand/15">
          {TIPS.map(({ Icon, title, text }) => (
            <div key={title} className="px-5 py-4 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-sand/25 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-forest/50" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-forest mb-1">{title}</p>
                <p className="text-xs text-gray/55 font-sans leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* PDF export – placeholder */}
        <button
          type="button"
          disabled
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed",
            "border-sand/40 bg-transparent px-5 py-3.5",
            "text-sm font-sans font-medium text-gray/40 cursor-not-allowed"
          )}
        >
          <Download className="w-4 h-4" strokeWidth={1.5} />
          PDF exportieren
          <span className="ml-auto text-xs text-sand/60 font-normal">Demnächst</span>
        </button>

        {/* Modul 2 – disabled */}
        <div className="relative">
          <button
            type="button"
            disabled
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl",
              "bg-forest/20 border border-forest/15 px-5 py-3.5",
              "text-sm font-sans font-semibold text-forest/40 cursor-not-allowed"
            )}
          >
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            Weiter zu Modul 2
            <span className="ml-auto text-xs font-normal text-forest/30">Demnächst verfügbar</span>
          </button>
        </div>

        <p className="text-xs text-gray/35 font-sans text-center">
          Klicke auf &ldquo;Abschließen&rdquo; unten, um Modul 1 zu speichern und zum Projekt zurückzukehren.
        </p>
      </div>

    </div>
  );
}
