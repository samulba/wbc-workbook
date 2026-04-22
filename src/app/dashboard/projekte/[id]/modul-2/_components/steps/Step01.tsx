"use client";

import { useMemo, useState } from "react";
import { Heart, X, RotateCcw, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { STYLES, STYLE_MAP } from "../stylesConfig";
import type { Module2Data, InteriorStyle } from "@/lib/types/module2";

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

export function Step01({ data, onChange }: Props) {
  const preferred = data.preferred_styles ?? [];
  const rejected  = data.rejected_styles  ?? [];
  const primary   = data.primary_style;

  // Build deck: all styles minus already-decided ones
  const decidedSet = useMemo(
    () => new Set<InteriorStyle>([...preferred, ...rejected]),
    [preferred, rejected],
  );
  const deck = STYLES.filter((s) => !decidedSet.has(s.value));

  const [flyingOut, setFlyingOut] = useState<null | { style: InteriorStyle; dir: "left" | "right" }>(null);

  function decide(style: InteriorStyle, action: "prefer" | "reject") {
    setFlyingOut({ style, dir: action === "prefer" ? "right" : "left" });
    setTimeout(() => {
      if (action === "prefer") {
        onChange({ preferred_styles: [...preferred, style] });
      } else {
        onChange({ rejected_styles: [...rejected, style] });
      }
      setFlyingOut(null);
    }, 240);
  }

  function undoLast() {
    const lastPreferred = preferred[preferred.length - 1];
    const lastRejected  = rejected[rejected.length - 1];
    // Heuristic: remove from whichever list had a decision most recently by checking array lengths
    if (preferred.length >= rejected.length && lastPreferred) {
      onChange({ preferred_styles: preferred.slice(0, -1) });
    } else if (lastRejected) {
      onChange({ rejected_styles: rejected.slice(0, -1) });
    }
  }

  function pickPrimary(style: InteriorStyle) {
    onChange({ primary_style: primary === style ? null : style });
  }

  const allDone = deck.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <h3 className="font-headline text-lg text-forest mb-1">Welcher Stil passt zu dir?</h3>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Tippe <strong>Herz</strong> für &bdquo;gefällt mir&ldquo; oder <strong>X</strong> für &bdquo;nicht mein Ding&ldquo;.
          Aus deinen Favoriten wählst du am Ende einen Leit-Stil für dein Konzept.
        </p>
      </div>

      {/* Deck */}
      {!allDone && (
        <div className="relative h-[420px]">
          {deck.slice(0, 3).reverse().map((s, i, arr) => {
            const isTop   = i === arr.length - 1;
            const offset  = (arr.length - 1 - i) * 8;
            const flying  = flyingOut?.style === s.value;
            const Icon    = s.Icon;
            return (
              <div
                key={s.value}
                className={cn(
                  "absolute inset-0 rounded-2xl border-2 border-sand/40 bg-white shadow-lg overflow-hidden transition-all duration-240 ease-out",
                  isTop ? "z-10" : "pointer-events-none",
                  flying && flyingOut.dir === "left"  && "translate-x-[-120%] rotate-[-12deg] opacity-0",
                  flying && flyingOut.dir === "right" && "translate-x-[120%]  rotate-[12deg]  opacity-0",
                )}
                style={{
                  transform: !flying ? `translateY(${offset}px) scale(${1 - (arr.length - 1 - i) * 0.04})` : undefined,
                }}
              >
                {/* Palette ribbon */}
                <div className="flex h-10">
                  {s.palette.map((c) => (
                    <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>

                <div className="p-5 flex flex-col gap-3 h-[calc(100%-40px)]">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-forest/70" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-xl text-forest leading-tight">{s.label}</h4>
                      <p className="text-[11px] uppercase tracking-widest text-sand font-sans mt-0.5">
                        {s.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray/60 font-sans leading-relaxed">{s.desc}</p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {s.keywords.map((k) => (
                      <span key={k} className="text-[11px] font-sans text-forest/60 bg-cream border border-sand/30 px-2.5 py-0.5 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      {!allDone && (
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => deck[0] && decide(deck[0].value, "reject")}
            className="w-14 h-14 rounded-full border-2 border-red-200 bg-white shadow-sm flex items-center justify-center hover:border-red-400 hover:bg-red-50 active:scale-95 transition"
            aria-label="Nicht mein Ding"
          >
            <X className="w-6 h-6 text-red-400" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={undoLast}
            disabled={preferred.length === 0 && rejected.length === 0}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-400 flex items-center justify-center hover:border-gray-300 hover:text-gray-600 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Rückgängig"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => deck[0] && decide(deck[0].value, "prefer")}
            className="w-14 h-14 rounded-full border-2 border-forest/30 bg-white shadow-sm flex items-center justify-center hover:border-forest hover:bg-forest/5 active:scale-95 transition"
            aria-label="Gefällt mir"
          >
            <Heart className="w-6 h-6 text-forest" strokeWidth={2} fill="currentColor" fillOpacity={0.1} />
          </button>
        </div>
      )}

      {allDone && preferred.length === 0 && (
        <div className="rounded-xl border border-dashed border-sand/50 px-5 py-6 text-center">
          <p className="text-sm text-gray/60 font-sans">
            Keine Favoriten? Klicke auf <RotateCcw className="inline w-3 h-3" /> und probiere es nochmal.
          </p>
        </div>
      )}

      {/* Favorites → pick primary */}
      {preferred.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-forest" strokeWidth={1.5} />
            <h4 className="font-headline text-base text-forest">Deine Favoriten</h4>
            <span className="text-xs text-gray/45 font-sans ml-auto">
              {primary ? "Leit-Stil gewählt" : "Wähle einen Leit-Stil"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {preferred.map((sv) => {
              const s = STYLE_MAP[sv];
              if (!s) return null;
              const active = primary === sv;
              return (
                <button
                  key={sv}
                  type="button"
                  onClick={() => pickPrimary(sv)}
                  className={cn(
                    "rounded-xl border text-left px-3.5 py-3 transition-all active:scale-[0.97]",
                    active ? "border-forest bg-forest/5 ring-2 ring-mint/30" : "border-sand/40 bg-white hover:border-forest/30",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-3 w-8 rounded-sm overflow-hidden border border-black/5 shrink-0">
                      {s.palette.map((c) => <div key={c} className="flex-1" style={{ background: c }} />)}
                    </div>
                    {active && <Star className="w-3 h-3 text-forest" strokeWidth={2} fill="currentColor" />}
                  </div>
                  <p className={cn("text-sm font-semibold mt-1.5 leading-tight", active ? "text-forest" : "text-forest/75")}>
                    {s.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Undo decisions */}
      {(preferred.length > 0 || rejected.length > 0) && (
        <p className="text-[11px] text-gray/40 font-sans">
          {preferred.length} Favoriten · {rejected.length} aussortiert · {deck.length} noch offen
        </p>
      )}
    </div>
  );
}
