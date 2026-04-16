"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  beforeUrl: string;
  afterUrl: string;
  className?: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl, className }: Props) {
  const [pct, setPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePct = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPct(Math.round((x / rect.width) * 100));
  }, []);

  // Global mouse/touch move + up handlers while dragging
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (dragging.current) updatePct(e.clientX);
    }
    function onMouseUp() {
      dragging.current = false;
    }
    function onTouchMove(e: TouchEvent) {
      if (dragging.current) updatePct(e.touches[0].clientX);
    }
    function onTouchEnd() {
      dragging.current = false;
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [updatePct]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl select-none touch-none cursor-ew-resize",
        className
      )}
      onMouseDown={(e) => { dragging.current = true; updatePct(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; updatePct(e.touches[0].clientX); }}
    >
      {/* Before (full, behind) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeUrl}
        alt="Vorher"
        className="w-full h-full object-cover block"
        draggable={false}
      />

      {/* After (clipped on top) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt="Nachher"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.3)]"
        style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg viewBox="0 0 20 20" className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 7L3 10l3 3M14 7l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="text-[11px] font-sans font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          Vorher
        </span>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="text-[11px] font-sans font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          Nachher
        </span>
      </div>
    </div>
  );
}
