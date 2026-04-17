"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EFFECTS, SLIDER_ORDER, type RoomEffect } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import { ProductRecommendations } from "../ProductRecommendations";

interface Props {
  data:     Module1Data;
  roomType: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

// Order → visual-config map
const ORDERED = SLIDER_ORDER.map(
  (value) => EFFECTS.find((e) => e.value === value)!,
);

export function Step04({ data, roomType, onChange }: Props) {
  // ── Slider index ────────────────────────────────────────────
  const initialIdx = useMemo(() => {
    if (!data.main_effect) return 2;       // Begegnung (middle) as default
    const i = SLIDER_ORDER.indexOf(data.main_effect as RoomEffect);
    return i < 0 ? 2 : i;
  }, [data.main_effect]);

  const [idx, setIdx]     = useState(initialIdx);
  const [hasChosen, setChosen] = useState(!!data.main_effect);

  const select = useCallback((nextIdx: number) => {
    const clamped = Math.max(0, Math.min(ORDERED.length - 1, nextIdx));
    setIdx(clamped);
    setChosen(true);
    onChange({ main_effect: ORDERED[clamped].value });
  }, [onChange]);

  // Keyboard arrow navigation inside the slider region
  function onSliderKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); select(idx + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); select(idx - 1); }
  }

  // ── Touch / drag on the card stage ──────────────────────────
  const dragStart = useRef<number | null>(null);
  function onPtrDown(e: React.PointerEvent)  { dragStart.current = e.clientX; }
  function onPtrUp(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) < 50) return;
    select(idx + (dx < 0 ? 1 : -1));
  }

  const active = ORDERED[idx];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Hero stage with morphing image + tint overlay ─── */}
      <div
        onPointerDown={onPtrDown}
        onPointerUp={onPtrUp}
        onKeyDown={onSliderKey}
        tabIndex={0}
        role="slider"
        aria-label="Raumwirkung wählen"
        aria-valuemin={0}
        aria-valuemax={ORDERED.length - 1}
        aria-valuenow={idx}
        aria-valuetext={active.label}
        className="relative rounded-3xl overflow-hidden shadow-lg ring-1 ring-forest/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/50 select-none"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Stacked images — only the active one is opaque */}
        {ORDERED.map((e, i) => (
          <div
            key={e.value}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <Image
              src={`${e.imageUrl}?auto=format&fit=crop&w=1200&q=80`}
              alt={e.label}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority={i === idx}
              className="object-cover"
              unoptimized
            />
          </div>
        ))}

        {/* Tint overlay (animates between moods) */}
        <div
          className="absolute inset-0 transition-[background] duration-700 pointer-events-none"
          style={{ background: active.tint }}
        />
        {/* Gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

        {/* Emoji bubble */}
        <div className="absolute top-5 left-5 w-14 h-14 rounded-2xl bg-white/85 backdrop-blur-md flex items-center justify-center text-3xl shadow-md">
          <span className="wbc-mood-bounce">{active.emoji}</span>
        </div>

        {/* Label overlay */}
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/75 mb-1">
            {active.keywords}
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl leading-tight drop-shadow-sm">
            {active.label}
          </h2>
        </div>

        {/* Arrow hints (desktop only) */}
        <button
          type="button"
          onClick={() => select(idx - 1)}
          disabled={idx === 0}
          aria-label="Vorherige Wirkung"
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-forest items-center justify-center shadow disabled:opacity-0 transition-opacity"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => select(idx + 1)}
          disabled={idx === ORDERED.length - 1}
          aria-label="Nächste Wirkung"
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-forest items-center justify-center shadow disabled:opacity-0 transition-opacity"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Slider control (dots + labels) ─────────────────── */}
      <div className="flex items-center justify-between gap-1 px-1">
        {ORDERED.map((e, i) => (
          <button
            key={e.value}
            type="button"
            onClick={() => select(i)}
            className="group flex flex-col items-center gap-1.5 flex-1 min-w-0"
            aria-label={e.label}
          >
            <span
              className={cn(
                "transition-all rounded-full",
                i === idx
                  ? "w-3 h-3 bg-forest"
                  : "w-2 h-2 bg-sand/60 group-hover:bg-forest/50",
              )}
            />
            <span
              className={cn(
                "text-[10px] sm:text-xs font-sans leading-tight text-center truncate max-w-full transition-colors",
                i === idx ? "font-medium text-forest" : "text-gray/50 group-hover:text-forest/70",
              )}
            >
              {e.emoji}{" "}
              <span className="hidden sm:inline">{e.label.split(" & ")[0]}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ── Blurb + description ─────────────────────────── */}
      <div
        className="rounded-2xl p-5 border transition-colors duration-500"
        style={{
          background:  active.tint,
          borderColor: "rgba(68,92,73,0.15)",
        }}
      >
        <p className="font-sans text-sm text-forest leading-relaxed mb-2 italic">
          {active.shortBlurb}
        </p>
        <p className="font-sans text-sm text-gray/70 leading-relaxed">
          {active.description}
        </p>
      </div>

      {/* ── Confirmation pill ────────────────────────────── */}
      {hasChosen && (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest text-white text-xs font-medium shadow-sm">
            <svg viewBox="0 0 10 8" className="w-3 h-2.5 fill-none stroke-white stroke-[2.5]">
              <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {active.label} gewählt
          </span>
        </div>
      )}

      {/* ── Product recommendations ───────────────────────── */}
      <ProductRecommendations
        roomType={roomType}
        mainEffect={data.main_effect}
        roomId={data.room_id ?? null}
        heading={`Passende Produkte für ${active.label}`}
        requireEffect
      />

      <style jsx>{`
        @keyframes wbc-mood-bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        .wbc-mood-bounce { animation: wbc-mood-bounce 2.4s ease-in-out infinite; display: inline-block; }
      `}</style>
    </div>
  );
}
