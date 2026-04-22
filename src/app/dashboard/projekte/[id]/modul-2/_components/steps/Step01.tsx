"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, X, RotateCcw, Trophy, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { STYLES, STYLE_MAP } from "../stylesConfig";
import type { StyleConfig } from "../stylesConfig";
import type { Module2Data, InteriorStyle } from "@/lib/types/module2";

const SWIPE_THRESHOLD  = 110;
const SWIPE_MAX_ROT_DEG = 18;

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

export function Step01({ data, onChange }: Props) {
  const preferred = data.preferred_styles ?? [];
  const rejected  = data.rejected_styles  ?? [];
  const primary   = data.primary_style;

  const decidedSet = useMemo(
    () => new Set<InteriorStyle>([...preferred, ...rejected]),
    [preferred, rejected],
  );
  const deck = useMemo(() => STYLES.filter((s) => !decidedSet.has(s.value)), [decidedSet]);

  const [flyingOut, setFlyingOut] = useState<null | { style: InteriorStyle; dir: "left" | "right" }>(null);
  const [drag, setDrag] = useState<{ dx: number; active: boolean }>({ dx: 0, active: false });

  const dragStart = useRef<{ x: number; y: number; id: string } | null>(null);
  const cardRef   = useRef<HTMLDivElement>(null);

  const allDone  = deck.length === 0;
  const topStyle = deck[0] ?? null;

  // ── Decide handler ───────────────────────────────────────────
  function decide(style: InteriorStyle, action: "prefer" | "reject") {
    setFlyingOut({ style, dir: action === "prefer" ? "right" : "left" });
    setDrag({ dx: 0, active: false });
    setTimeout(() => {
      if (action === "prefer") {
        onChange({ preferred_styles: [...preferred, style] });
      } else {
        onChange({ rejected_styles: [...rejected, style] });
      }
      setFlyingOut(null);
    }, 300);
  }

  function undoLast() {
    const lastPreferred = preferred[preferred.length - 1];
    const lastRejected  = rejected[rejected.length - 1];
    if (preferred.length >= rejected.length && lastPreferred) {
      onChange({ preferred_styles: preferred.slice(0, -1) });
    } else if (lastRejected) {
      onChange({ rejected_styles: rejected.slice(0, -1) });
    }
  }

  function pickPrimary(style: InteriorStyle) {
    onChange({ primary_style: primary === style ? null : style });
  }

  // ── Drag handlers ────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!topStyle || flyingOut) return;
    dragStart.current = { x: e.clientX, y: e.clientY, id: topStyle.value };
    setDrag({ dx: 0, active: true });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    setDrag({ dx, active: true });
  }

  function onPointerUp() {
    if (!dragStart.current || !topStyle) {
      setDrag({ dx: 0, active: false });
      dragStart.current = null;
      return;
    }
    const dx = drag.dx;
    if (dx > SWIPE_THRESHOLD) {
      decide(topStyle.value, "prefer");
    } else if (dx < -SWIPE_THRESHOLD) {
      decide(topStyle.value, "reject");
    } else {
      // Snap back
      setDrag({ dx: 0, active: false });
    }
    dragStart.current = null;
  }

  // Keyboard support: ← reject / → prefer / ↩ undo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!topStyle || flyingOut) return;
      if (e.key === "ArrowRight") decide(topStyle.value, "prefer");
      if (e.key === "ArrowLeft")  decide(topStyle.value, "reject");
      if (e.key === "Backspace")  undoLast();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topStyle?.value, flyingOut]);

  const dragIntensity = Math.min(1, Math.abs(drag.dx) / SWIPE_THRESHOLD);
  const totalDecided  = preferred.length + rejected.length;
  const totalStyles   = STYLES.length;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Intro ─────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-forest/6 to-mint/10 border border-forest/15 p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-headline text-lg text-forest mb-0.5">Welcher Stil passt zu dir?</h3>
          <p className="text-sm text-gray/65 font-sans leading-relaxed">
            Swipe nach <span className="text-forest font-medium">rechts</span> für &bdquo;gefällt mir&ldquo;,
            nach <span className="text-red-500/80 font-medium">links</span> für &bdquo;nicht mein Ding&ldquo;.
            Tastatur: ←/→/⌫
          </p>
        </div>
      </div>

      {/* ── Deck ──────────────────────────────────────────── */}
      {!allDone && (
        <div className="relative h-[480px] select-none" style={{ touchAction: "pan-y" }}>
          {deck.slice(0, 3).reverse().map((s, i, arr) => {
            const isTop   = i === arr.length - 1;
            const depthIx = arr.length - 1 - i;
            const flying  = flyingOut?.style === s.value;

            let transform: string | undefined;
            if (flying) {
              transform = flyingOut.dir === "left"
                ? "translate(-130%, -20px) rotate(-14deg)"
                : "translate(130%, -20px) rotate(14deg)";
            } else if (isTop) {
              const rot = (drag.dx / SWIPE_THRESHOLD) * SWIPE_MAX_ROT_DEG;
              transform = `translateX(${drag.dx}px) translateY(${-drag.dx * 0.05}px) rotate(${rot}deg)`;
            } else {
              transform = `translateY(${depthIx * 10}px) scale(${1 - depthIx * 0.04})`;
            }

            return (
              <div
                key={s.value}
                ref={isTop ? cardRef : undefined}
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerUp : undefined}
                onPointerCancel={isTop ? onPointerUp : undefined}
                className={cn(
                  "absolute inset-0 rounded-3xl overflow-hidden shadow-xl",
                  isTop ? "z-10 cursor-grab active:cursor-grabbing" : "pointer-events-none",
                  flying                        && "transition-all duration-300 ease-out opacity-0",
                  !flying && !drag.active       && "transition-transform duration-300 ease-out",
                )}
                style={{
                  transform,
                  boxShadow: isTop ? "0 24px 60px -20px rgba(0,0,0,0.25)" : "0 12px 30px -10px rgba(0,0,0,0.18)",
                }}
              >
                <StyleCard style={s} dragDx={isTop ? drag.dx : 0} />
              </div>
            );
          })}

          {/* Drag hint labels (only while dragging) */}
          {drag.active && Math.abs(drag.dx) > 20 && (
            <div
              className={cn(
                "absolute top-6 z-20 pointer-events-none font-headline text-4xl rotate-[-10deg] tracking-wide px-4 py-1.5 rounded-xl border-4",
                drag.dx > 0
                  ? "right-6 text-forest border-forest bg-forest/10"
                  : "left-6 text-red-500 border-red-500 bg-red-50 rotate-[10deg]",
              )}
              style={{ opacity: dragIntensity }}
            >
              {drag.dx > 0 ? "LOVE" : "NOPE"}
            </div>
          )}
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────── */}
      {!allDone && (
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => topStyle && decide(topStyle.value, "reject")}
            className="relative group w-16 h-16 rounded-full border-2 border-red-300/70 bg-white shadow-md flex items-center justify-center hover:border-red-400 hover:bg-red-50 hover:shadow-lg active:scale-95 transition-all"
            aria-label="Nicht mein Ding"
          >
            <X className="w-7 h-7 text-red-400 group-hover:text-red-500" strokeWidth={2.5} />
            <span className="absolute -bottom-5 text-[10px] uppercase tracking-widest font-sans text-red-400/70 font-medium">
              Nope
            </span>
          </button>

          <button
            type="button"
            onClick={undoLast}
            disabled={totalDecided === 0}
            className="w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-400 flex items-center justify-center hover:border-gray-300 hover:text-gray-600 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            aria-label="Rückgängig"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={() => topStyle && decide(topStyle.value, "prefer")}
            className="relative group w-16 h-16 rounded-full border-2 border-forest/40 bg-white shadow-md flex items-center justify-center hover:border-forest hover:bg-forest/5 hover:shadow-lg active:scale-95 transition-all"
            aria-label="Gefällt mir"
          >
            <Heart className="w-7 h-7 text-forest group-hover:text-forest" strokeWidth={2.5} fill="currentColor" fillOpacity={0.15} />
            <span className="absolute -bottom-5 text-[10px] uppercase tracking-widest font-sans text-forest/70 font-medium">
              Love
            </span>
          </button>
        </div>
      )}

      {/* ── Deck progress ─────────────────────────────────── */}
      {(totalDecided > 0 || !allDone) && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-sand/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-forest/70 transition-all duration-400"
              style={{ width: `${Math.round((totalDecided / totalStyles) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray/45 font-sans tabular-nums">
            {totalDecided} / {totalStyles}
          </p>
        </div>
      )}

      {allDone && preferred.length === 0 && (
        <div className="rounded-xl border border-dashed border-sand/50 px-5 py-8 text-center">
          <p className="text-sm text-gray/60 font-sans mb-2">
            Keine Favoriten dabei?
          </p>
          <button
            type="button"
            onClick={undoLast}
            disabled={totalDecided === 0}
            className="inline-flex items-center gap-1.5 text-sm text-forest font-sans font-medium hover:text-forest/80"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            Letzte Entscheidung rückgängig
          </button>
        </div>
      )}

      {/* ── Favorites → pick primary ──────────────────────── */}
      {preferred.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-forest" strokeWidth={1.75} />
            <h4 className="font-headline text-base text-forest">Deine Favoriten</h4>
            <span className="text-xs text-gray/45 font-sans ml-auto">
              {primary ? "Leit-Stil gewählt" : "Wähle einen Leit-Stil"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                    "group relative rounded-xl overflow-hidden text-left transition-all active:scale-[0.97] border-2",
                    active ? "border-forest shadow-md ring-2 ring-mint/30" : "border-transparent hover:border-forest/30",
                  )}
                >
                  <div className="flex h-10">
                    {s.palette.map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className={cn("px-3 py-2 flex items-center gap-2", active ? "bg-forest text-cream" : "bg-white")}>
                    <s.Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-cream" : "text-forest/60")} strokeWidth={1.75} />
                    <p className={cn("text-sm font-semibold leading-tight flex-1 truncate", active ? "text-cream" : "text-forest")}>
                      {s.label}
                    </p>
                    {active && <Star className="w-3.5 h-3.5 text-cream shrink-0" strokeWidth={2} fill="currentColor" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(preferred.length > 0 || rejected.length > 0) && !allDone && (
        <p className="text-[11px] text-gray/40 font-sans">
          {preferred.length} Favoriten · {rejected.length} aussortiert · {deck.length} noch offen
        </p>
      )}
    </div>
  );
}

// ── Card visual ────────────────────────────────────────────────────────────

function StyleCard({ style, dragDx }: { style: StyleConfig; dragDx: number }) {
  const { label, tagline, desc, palette, keywords, Icon, value } = style;
  const [bgLight, bgMid, bgDeep, bgDarkest] = [
    palette[0] ?? "#eee", palette[1] ?? "#ddd", palette[2] ?? "#999", palette[3] ?? "#333",
  ];

  // Drag-direction tint (green preferred / red reject)
  const intensity = Math.min(1, Math.abs(dragDx) / SWIPE_THRESHOLD);
  const tintColor = dragDx > 0 ? "rgba(68, 92, 73, 0.18)" : dragDx < 0 ? "rgba(220, 60, 60, 0.18)" : "transparent";

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        background: `linear-gradient(155deg, ${bgLight} 0%, ${bgMid} 45%, ${bgDeep} 100%)`,
      }}
    >
      {/* Decorative artwork */}
      <StyleArtwork value={value} darkest={bgDarkest} />

      {/* Drag-direction tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors"
        style={{ background: tintColor, opacity: intensity }}
      />

      {/* Top-left icon badge */}
      <div className="absolute top-5 left-5 w-12 h-12 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-md">
        <Icon className="w-6 h-6 text-forest" strokeWidth={1.5} />
      </div>

      {/* Palette ribbon – narrow, top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        {palette.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* Content anchored bottom */}
      <div className="relative mt-auto p-6 pt-20 bg-gradient-to-t from-black/35 via-black/15 to-transparent">
        <p
          className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium mb-1.5"
          style={{ color: "rgba(255,255,255,0.78)", textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
        >
          {tagline}
        </p>
        <h4
          className="font-headline text-4xl sm:text-5xl text-white leading-[0.95] mb-3"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
        >
          {label}
        </h4>
        <p
          className="text-sm font-sans leading-relaxed mb-4 max-w-[28ch]"
          style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}
        >
          {desc}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span
              key={k}
              className="text-[11px] font-sans px-2.5 py-1 rounded-full backdrop-blur-md border"
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderColor:     "rgba(255,255,255,0.28)",
                color:           "rgba(255,255,255,0.95)",
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Per-style decorative artwork (abstract) ────────────────────────────────

function StyleArtwork({ value, darkest }: { value: InteriorStyle; darkest: string }) {
  const stroke = darkest;
  const common = "absolute inset-0 pointer-events-none opacity-[0.22]";

  switch (value) {
    case "skandi":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Simple mountain silhouette + sun */}
          <circle cx="310" cy="110" r="32" fill={stroke} opacity="0.35" />
          <polygon points="0,400 130,200 230,320 330,180 400,400" fill={stroke} opacity="0.3" />
          <polygon points="120,400 230,240 330,400" fill={stroke} opacity="0.45" />
        </svg>
      );
    case "japandi":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Zen circle + branch */}
          <circle cx="300" cy="140" r="90" fill="none" stroke={stroke} strokeWidth="3" opacity="0.45" />
          <path d="M 30 450 C 120 420, 200 380, 280 280" fill="none" stroke={stroke} strokeWidth="2" opacity="0.5" />
          <circle cx="200" cy="370" r="4" fill={stroke} />
          <circle cx="150" cy="400" r="3" fill={stroke} />
        </svg>
      );
    case "boho":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Wavy/flowy patterns */}
          <path d="M 0 120 Q 100 80 200 120 T 400 120" fill="none" stroke={stroke} strokeWidth="2" opacity="0.5" />
          <path d="M 0 180 Q 100 140 200 180 T 400 180" fill="none" stroke={stroke} strokeWidth="2" opacity="0.4" />
          <path d="M 0 240 Q 100 200 200 240 T 400 240" fill="none" stroke={stroke} strokeWidth="2" opacity="0.3" />
          <circle cx="80"  cy="400" r="30" fill={stroke} opacity="0.35" />
          <circle cx="320" cy="430" r="18" fill={stroke} opacity="0.4" />
        </svg>
      );
    case "mid_century":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Geometric circles + triangles */}
          <circle cx="320" cy="130" r="50" fill="none" stroke={stroke} strokeWidth="4" opacity="0.5" />
          <circle cx="320" cy="130" r="20" fill={stroke} opacity="0.4" />
          <polygon points="50,450 150,300 250,450" fill={stroke} opacity="0.35" />
          <line x1="0" y1="220" x2="400" y2="220" stroke={stroke} strokeWidth="1.5" opacity="0.3" />
        </svg>
      );
    case "industrial":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Grid / metal beams */}
          <g stroke={stroke} strokeWidth="2" opacity="0.35" fill="none">
            <line x1="0"   y1="100" x2="400" y2="100" />
            <line x1="0"   y1="200" x2="400" y2="200" />
            <line x1="0"   y1="300" x2="400" y2="300" />
            <line x1="100" y1="0"   x2="100" y2="500" />
            <line x1="200" y1="0"   x2="200" y2="500" />
            <line x1="300" y1="0"   x2="300" y2="500" />
          </g>
          <rect x="270" y="90" width="80" height="80" fill={stroke} opacity="0.35" />
        </svg>
      );
    case "classic":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Ornate arch / column */}
          <path d="M 150 500 L 150 200 Q 150 130 200 130 Q 250 130 250 200 L 250 500 Z" fill="none" stroke={stroke} strokeWidth="2" opacity="0.45" />
          <line x1="150" y1="260" x2="250" y2="260" stroke={stroke} strokeWidth="2" opacity="0.4" />
          <circle cx="200" cy="160" r="8" fill={stroke} opacity="0.5" />
        </svg>
      );
    case "modern":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Clean rectangular composition */}
          <rect x="60"  y="100" width="120" height="240" fill="none" stroke={stroke} strokeWidth="2" opacity="0.4" />
          <rect x="210" y="150" width="140" height="90"  fill={stroke} opacity="0.3" />
          <rect x="210" y="260" width="140" height="80"  fill="none" stroke={stroke} strokeWidth="2" opacity="0.4" />
        </svg>
      );
    case "rustic":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Wood grain + small tree */}
          <g stroke={stroke} strokeWidth="1.5" opacity="0.4" fill="none">
            <path d="M 20 140 Q 200 120 380 140" />
            <path d="M 20 200 Q 200 220 380 200" />
            <path d="M 20 260 Q 200 240 380 260" />
          </g>
          <path d="M 320 420 L 320 360 L 300 360 L 330 310 L 360 360 L 340 360 L 340 420 Z" fill={stroke} opacity="0.45" />
        </svg>
      );
    case "minimalist":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Single circle + line */}
          <circle cx="280" cy="180" r="70" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.45" />
          <line x1="40" y1="400" x2="360" y2="400" stroke={stroke} strokeWidth="1.5" opacity="0.4" />
        </svg>
      );
    case "eclectic":
      return (
        <svg className={common} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          {/* Chaotic mix of shapes */}
          <circle cx="80"  cy="120" r="30" fill={stroke} opacity="0.35" />
          <rect   x="200" y="80"  width="70" height="70" fill="none" stroke={stroke} strokeWidth="2" opacity="0.4" />
          <polygon points="320,400 360,340 390,400" fill={stroke} opacity="0.4" />
          <path d="M 50 350 Q 100 300 150 350 T 250 350" fill="none" stroke={stroke} strokeWidth="2" opacity="0.35" />
        </svg>
      );
    default:
      return null;
  }
}
