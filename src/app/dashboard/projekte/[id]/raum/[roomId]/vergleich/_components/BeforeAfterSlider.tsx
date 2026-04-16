"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronsLeftRight } from "lucide-react";

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl }: Props) {
  const [pos, setPos]       = useState(50); // 0-100, divider from left in %
  const containerRef        = useRef<HTMLDivElement>(null);
  const isDragging          = useRef(false);

  function calcPos(clientX: number): number {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return pos;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    isDragging.current = true;
    containerRef.current?.setPointerCapture(e.pointerId);
    setPos(calcPos(e.clientX));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    setPos(calcPos(e.clientX));
  }

  function handlePointerUp() {
    isDragging.current = false;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl select-none touch-none cursor-col-resize shadow-warm-sm"
      style={{ aspectRatio: "16/9" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── Before image (full) ─────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeUrl}
        alt="Vorher"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* ── After image (clipped from left at pos%) ─────────── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt="Nachher"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* ── Labels ──────────────────────────────────────────── */}
      <span
        className={cn(
          "absolute top-4 left-4 text-[10px] font-sans font-bold uppercase tracking-[0.18em]",
          "bg-black/40 text-white/90 rounded-md px-2.5 py-1 pointer-events-none",
          "transition-opacity duration-150",
          pos < 12 ? "opacity-0" : "opacity-100"
        )}
      >
        Vorher
      </span>
      <span
        className={cn(
          "absolute top-4 right-4 text-[10px] font-sans font-bold uppercase tracking-[0.18em]",
          "bg-black/40 text-white/90 rounded-md px-2.5 py-1 pointer-events-none",
          "transition-opacity duration-150",
          pos > 88 ? "opacity-0" : "opacity-100"
        )}
      >
        Nachher
      </span>

      {/* ── Divider line + handle ────────────────────────────── */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        {/* Drag handle */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-10 h-10 rounded-full bg-white shadow-xl",
            "flex items-center justify-center pointer-events-none",
          )}
        >
          <ChevronsLeftRight className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </div>
      </div>

      {/* ── Hint (first render) ──────────────────────────────── */}
      {pos === 50 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] font-sans text-white/70 bg-black/30 rounded-full px-3 py-1">
            Ziehe den Regler zum Vergleichen
          </span>
        </div>
      )}
    </div>
  );
}
