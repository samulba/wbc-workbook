"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following ambient glow layer for the landing hero.
 * Two soft orbs that drift toward the pointer with eased transform.
 * Pure transforms — no re-renders.
 */
export function AmbientParallax() {
  const warm = useRef<HTMLDivElement>(null);
  const cool = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let tx = 0, ty = 0;
    let cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 60;
      ty = (e.clientY / window.innerHeight - 0.5) * 60;
    };

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (warm.current) warm.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (cool.current) cool.current.style.transform = `translate3d(${-cx * 0.6}px, ${-cy * 0.6}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Warm central glow — follows cursor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          ref={warm}
          className="w-[min(1100px,120vw)] h-[min(700px,80vh)] rounded-full bg-sand/25 blur-3xl animate-breathe"
        />
      </div>
      {/* Cool secondary — counter-drift */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          ref={cool}
          className="w-[700px] h-[700px] rounded-full bg-sand/[0.08] blur-3xl"
        />
      </div>
    </div>
  );
}
