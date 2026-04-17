"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpen, Sparkles, Target, Lightbulb, ShoppingBag, Heart,
  ArrowRight, X,
} from "lucide-react";
import { markTourSeen } from "@/app/actions/tour";

// ── Step config ─────────────────────────────────────────────────────────────

type Step = {
  key:        string;
  kind:       "modal" | "spotlight";
  title:      string;
  description:string;
  target?:    string;
  emoji?:     string;
  icon?:      React.ElementType;
  iconTint?:  "mint" | "forest" | "terracotta" | "sand";
  confetti?:  boolean;
  primary?:   { label: string; action: "next" | "nav"; href?: string };
  secondary?: { label: string; action: "close" };
};

const STEPS: Step[] = [
  {
    key:         "welcome",
    kind:        "modal",
    title:       "Willkommen im Wellbeing Workbook",
    description: "In 60 Sekunden zeigen wir dir, wie du deinen Traumraum gestaltest.",
    emoji:       "👋",
    confetti:    true,
    primary:     { label: "Los geht's", action: "next" },
  },
  {
    key:         "projekte",
    kind:        "spotlight",
    target:      '[data-tour="nav-projekte"]',
    title:       "Deine Projekte",
    description: "Hier findest du alle deine Raumkonzepte. Ein Projekt kann mehrere Räume haben.",
    icon:        FolderOpen,
    iconTint:    "mint",
  },
  {
    key:         "new-project",
    kind:        "spotlight",
    target:      '[data-tour="new-project"]',
    title:       "Neues Projekt starten",
    description: "Wähle Raumtyp, Budget und Wunschdatum — und leg los.",
    icon:        Sparkles,
    iconTint:    "terracotta",
  },
  {
    key:         "modul",
    kind:        "spotlight",
    target:      '[data-tour="modul-overview"]',
    title:       "Das Herzstück: Modul 1",
    description: "11 geführte Schritte zum kompletten Raumkonzept — Wirkung, Farben, Materialien, Moodboard.",
    icon:        Target,
    iconTint:    "forest",
  },
  {
    key:         "inspiration",
    kind:        "spotlight",
    target:      '[data-tour="nav-inspiration"]',
    title:       "Inspiration sammeln",
    description: "Hunderte Bilder zum Durchstöbern. Favoriten speichern, eigene Sammlungen erstellen.",
    icon:        Lightbulb,
    iconTint:    "sand",
  },
  {
    key:         "shopping",
    kind:        "spotlight",
    target:      '[data-tour="nav-shopping"]',
    title:       "Shopping-Listen mit Budget",
    description: "Sammle Produkte, behalte Prioritäten und Kosten im Blick.",
    icon:        ShoppingBag,
    iconTint:    "mint",
  },
  {
    key:         "favoriten",
    kind:        "spotlight",
    target:      '[data-tour="nav-favoriten"]',
    title:       "Deine Favoriten",
    description: "Alle gemerkten Produkte — jederzeit griffbereit.",
    icon:        Heart,
    iconTint:    "forest",
  },
  {
    key:         "done",
    kind:        "modal",
    title:       "Du bist startklar",
    description: "Tipp: Starte mit einem kleinen Raum wie dem Bad — so lernst du die App am schnellsten kennen.",
    emoji:       "🎉",
    confetti:    true,
    primary:     { label: "Erstes Projekt erstellen", action: "nav", href: "/dashboard/projekte/neu" },
    secondary:   { label: "Erstmal umschauen", action: "close" },
  },
];

// ── Geometry types ──────────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number; }
interface PopoverPos {
  top:    number;
  left:   number;
  placement: "top" | "bottom" | "center";
  arrowOffset?: number;
}

const POPOVER_W = 360;
const GAP       = 18;

// ── Main component ───────────────────────────────────────────────────────────

export function WelcomeTour({ autoStart }: { autoStart: boolean }) {
  const router   = useRouter();
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pop,  setPop]  = useState<PopoverPos>({ top: 0, left: 0, placement: "center" });
  const [slideDir, setSlideDir] = useState<"next" | "prev" | "in">("in");
  const startedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // ── Expose replay hook ─────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__startWelcomeTour = () => {
      setStepIdx(0);
      setSlideDir("in");
      setActive(true);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__startWelcomeTour;
    };
  }, []);

  // ── Auto-start ────────────────────────────────────────────────
  useEffect(() => {
    if (!autoStart || startedRef.current) return;
    startedRef.current = true;
    const t = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(t);
  }, [autoStart]);

  const step   = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  // ── Finish / close ─────────────────────────────────────────────
  const finish = useCallback((navigateTo?: string) => {
    setActive(false);
    setTimeout(() => { void markTourSeen(); }, 0);
    if (navigateTo) router.push(navigateTo);
  }, [router]);

  // ── Compute spotlight rect + popover position ──────────────────
  useLayoutEffect(() => {
    if (!active) return;

    if (step.kind === "modal") {
      setRect(null);
      setPop({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: "center",
      });
      return;
    }

    const findAndPlace = () => {
      const el = document.querySelector(step.target!);
      if (!el) { setRect(null); return; }

      // Scroll into view if needed
      const r0 = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r0.top < 40 || r0.bottom > vh - 40) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }

      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const nextRect: Rect = {
          top: r.top, left: r.left, width: r.width, height: r.height,
        };
        setRect(nextRect);

        // Popover placement: below if room, else above
        const spaceBelow = window.innerHeight - (nextRect.top + nextRect.height);
        const popoverH   = 230;
        const placement  = spaceBelow > popoverH + GAP + 20 ? "bottom" : "top";

        const isMobile = window.innerWidth < 640;
        const w        = isMobile ? Math.min(window.innerWidth - 32, POPOVER_W) : POPOVER_W;

        const targetMid = nextRect.left + nextRect.width / 2;
        let   left      = targetMid - w / 2;
        left            = Math.max(16, Math.min(window.innerWidth - w - 16, left));
        const arrowOffset = targetMid - left;

        const top = placement === "bottom"
          ? nextRect.top + nextRect.height + GAP
          : nextRect.top - GAP - popoverH;

        setPop({ top, left, placement, arrowOffset });
      });
    };

    findAndPlace();

    const onResize = () => findAndPlace();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, stepIdx, step]);

  // ── Keyboard ──────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     finish();
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft")  back();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx]);

  function advance() {
    if (isLast) return;
    setSlideDir("next");
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function back() {
    if (stepIdx === 0) return;
    setSlideDir("prev");
    setStepIdx((i) => Math.max(0, i - 1));
  }

  // ── Swipe ─────────────────────────────────────────────────────
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) advance();
    else        back();
  }

  if (!mounted || !active) return null;

  const padding = 8;
  const spotlightRect = rect ? {
    x: Math.max(0, rect.left - padding),
    y: Math.max(0, rect.top - padding),
    w: rect.width + padding * 2,
    h: rect.height + padding * 2,
  } : null;

  const isCenter = step.kind === "modal";

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* ── Overlay with SVG mask cutout ─────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={() => {/* block clicks */}}
      >
        <defs>
          <mask id="wbc-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.x}
                y={spotlightRect.y}
                width={spotlightRect.w}
                height={spotlightRect.h}
                rx={14}
                ry={14}
                fill="black"
                className="wbc-tour-cutout-rect"
              />
            )}
          </mask>
          <filter id="wbc-tour-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(17, 26, 18, 0.62)"
          mask="url(#wbc-tour-mask)"
        />

        {/* Mint glow outline around spotlight */}
        {spotlightRect && (
          <>
            <rect
              x={spotlightRect.x - 2}
              y={spotlightRect.y - 2}
              width={spotlightRect.w + 4}
              height={spotlightRect.h + 4}
              rx={16}
              ry={16}
              fill="none"
              stroke="#94c1a4"
              strokeWidth={2.5}
              className="wbc-tour-pulse"
              opacity={0.9}
            />
          </>
        )}
      </svg>

      {/* ── Confetti (step.confetti only) ─────────────────────── */}
      {step.confetti && <Confetti />}

      {/* ── Popover ─────────────────────────────────────────── */}
      <div
        key={stepIdx}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`pointer-events-auto absolute wbc-tour-enter wbc-tour-slide-${slideDir}`}
        style={
          isCenter
            ? {
                top:  "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width:  "min(92vw, 440px)",
              }
            : {
                top:  `${pop.top}px`,
                left: `${pop.left}px`,
                width: "min(92vw, 360px)",
              }
        }
      >
        <TourCard
          step={step}
          stepIndex={stepIdx}
          totalSteps={STEPS.length}
          placement={pop.placement}
          arrowOffset={pop.arrowOffset}
          onNext={advance}
          onPrev={back}
          onClose={() => finish()}
          onDone={(href) => finish(href)}
          isLast={isLast}
        />
      </div>

      {/* ── Global tour CSS ────────────────────────────────── */}
      <style jsx global>{`
        @keyframes wbc-tour-enter {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes wbc-tour-slide-next {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wbc-tour-slide-prev {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wbc-tour-pulse-stroke {
          0%, 100% { opacity: 0.9; stroke-width: 2.5; }
          50%      { opacity: 0.4; stroke-width: 4; }
        }
        @keyframes wbc-tour-cutout {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wbc-tour-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25%      { transform: translateY(-8px) scale(1.05); }
          50%      { transform: translateY(0) scale(1); }
          75%      { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes wbc-tour-icon-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(148, 193, 164, 0.5); }
          70%      { box-shadow: 0 0 0 14px rgba(148, 193, 164, 0); }
        }
        @keyframes wbc-tour-button-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(68, 92, 73, 0); }
          50%      { box-shadow: 0 0 18px 0 rgba(68, 92, 73, 0.4); }
        }
        .wbc-tour-enter         { animation: wbc-tour-enter 300ms cubic-bezier(0.22, 1, 0.36, 1); }
        .wbc-tour-slide-next    { animation: wbc-tour-slide-next 360ms cubic-bezier(0.22, 1, 0.36, 1); }
        .wbc-tour-slide-prev    { animation: wbc-tour-slide-prev 360ms cubic-bezier(0.22, 1, 0.36, 1); }
        .wbc-tour-slide-in      { animation: wbc-tour-enter     420ms cubic-bezier(0.22, 1, 0.36, 1); }
        .wbc-tour-pulse         { animation: wbc-tour-pulse-stroke 2.2s ease-in-out infinite; transform-origin: center; }
        .wbc-tour-cutout-rect   { animation: wbc-tour-cutout 260ms ease-out; }
        .wbc-tour-bounce        { animation: wbc-tour-bounce 1.6s ease-in-out infinite; display: inline-block; }
        .wbc-tour-icon-pulse    { animation: wbc-tour-icon-pulse 2s ease-out infinite; }
        .wbc-tour-button-glow:hover { animation: wbc-tour-button-glow 1.4s ease-in-out infinite; }
      `}</style>
    </div>,
    document.body,
  );
}

// ── Tour Card ────────────────────────────────────────────────────────────────

function TourCard({
  step, stepIndex, totalSteps, placement, arrowOffset,
  onNext, onPrev, onClose, onDone, isLast,
}: {
  step:        Step;
  stepIndex:   number;
  totalSteps:  number;
  placement:   "top" | "bottom" | "center";
  arrowOffset?: number;
  onNext:      () => void;
  onPrev:      () => void;
  onClose:     () => void;
  onDone:      (href?: string) => void;
  isLast:      boolean;
}) {
  const hasPrev = stepIndex > 0 && !isLast;

  const iconBg: Record<NonNullable<Step["iconTint"]>, string> = {
    mint:       "bg-mint/20",
    forest:     "bg-forest/15",
    terracotta: "bg-terracotta/15",
    sand:       "bg-sand/25",
  };
  const iconColor: Record<NonNullable<Step["iconTint"]>, string> = {
    mint:       "text-mint",
    forest:     "text-forest",
    terracotta: "text-terracotta",
    sand:       "text-sand",
  };

  return (
    <div className="relative">
      {/* Arrow */}
      {placement !== "center" && arrowOffset !== undefined && (
        <div
          className="absolute w-3 h-3 rotate-45 bg-gradient-to-br from-cream to-white border-forest/10 shadow-sm"
          style={{
            left: `${arrowOffset - 6}px`,
            [placement === "bottom" ? "top" : "bottom"]: placement === "bottom" ? "-6px" : "-6px",
            borderTop:    placement === "bottom" ? "1px solid rgba(68,92,73,0.12)" : undefined,
            borderLeft:   placement === "bottom" ? "1px solid rgba(68,92,73,0.12)" : undefined,
            borderBottom: placement === "top"    ? "1px solid rgba(68,92,73,0.12)" : undefined,
            borderRight:  placement === "top"    ? "1px solid rgba(68,92,73,0.12)" : undefined,
          }}
        />
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border border-forest/10 bg-gradient-to-br from-cream to-white shadow-2xl`}
        style={{
          boxShadow: "0 25px 50px -12px rgba(68, 92, 73, 0.25), 0 0 0 1px rgba(148, 193, 164, 0.06)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-forest/40 hover:text-terracotta hover:bg-forest/5 transition-colors"
          aria-label="Tour überspringen"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Body */}
        <div className={`${step.kind === "modal" ? "p-8 sm:p-10" : "p-6"} text-center`}>
          {/* Icon / Emoji */}
          {step.emoji ? (
            <div className="mb-5 flex justify-center">
              <span className="text-5xl sm:text-6xl wbc-tour-bounce">{step.emoji}</span>
            </div>
          ) : step.icon && step.iconTint ? (
            <div className="mb-4 flex justify-center">
              <div className={`w-14 h-14 rounded-2xl ${iconBg[step.iconTint]} flex items-center justify-center wbc-tour-icon-pulse`}>
                <step.icon className={`w-7 h-7 ${iconColor[step.iconTint]}`} strokeWidth={1.5} />
              </div>
            </div>
          ) : null}

          {/* Title */}
          <h2
            className={`font-headline leading-tight mb-2 ${
              isLast
                ? "text-3xl sm:text-4xl bg-gradient-to-r from-forest via-mint to-forest bg-clip-text text-transparent"
                : step.kind === "modal"
                ? "text-2xl sm:text-3xl text-forest font-bold"
                : "text-xl text-forest font-bold"
            }`}
          >
            {step.title}
          </h2>

          {/* Description */}
          <p className={`${step.kind === "modal" ? "text-base" : "text-sm"} text-gray-600 leading-relaxed max-w-md mx-auto`}>
            {step.description}
          </p>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            {/* Last step: two buttons side-by-side */}
            {isLast ? (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={step.primary!.href!}
                  onClick={() => onDone(step.primary!.href)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-forest to-forest/80 text-white px-6 py-3 text-sm font-medium shadow-lg hover:scale-[1.03] hover:shadow-xl transition-all duration-200 wbc-tour-button-glow"
                >
                  {step.primary!.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-forest/25 text-forest px-6 py-3 text-sm font-medium hover:bg-forest/5 hover:border-forest/40 transition-all duration-200"
                >
                  {step.secondary!.label}
                </button>
              </div>
            ) : step.kind === "modal" && step.primary ? (
              /* First step: single CTA */
              <button
                onClick={onNext}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-forest to-forest/80 text-white px-7 py-3 text-sm font-medium shadow-lg hover:scale-[1.03] hover:shadow-xl transition-all duration-200 wbc-tour-button-glow group"
              >
                {step.primary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              /* Spotlight steps: prev/next */
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="text-sm text-gray-400 hover:text-forest transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                  Zurück
                </button>
                <button
                  onClick={onNext}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-forest to-forest/80 text-white px-5 py-2 text-sm font-medium shadow-md hover:scale-[1.05] hover:shadow-lg transition-all duration-200 wbc-tour-button-glow group"
                >
                  Weiter
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Skip link (spotlight + welcome only, not done) */}
          {!isLast && (
            <button
              onClick={onClose}
              className="mt-4 text-xs text-gray-400 hover:text-forest transition-colors"
            >
              Tour überspringen
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4 pt-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === stepIndex
                  ? "w-6 h-1.5 bg-forest"
                  : i < stepIndex
                  ? "w-1.5 h-1.5 bg-forest/50"
                  : "w-1.5 h-1.5 bg-forest/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Confetti (welcome + done) ────────────────────────────────────────────────

const CONFETTI_COLORS = ["#94c1a4", "#cba178", "#823509", "#445c49", "#f6ede2"];

function Confetti() {
  const particles = Array.from({ length: 36 }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const left  = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const dur   = 3 + Math.random() * 2;
    const size  = 6 + Math.random() * 8;
    const drift = (Math.random() - 0.5) * 80;
    const rot   = Math.random() * 360;
    return { i, color, left, delay, dur, size, rot, drift };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.i}
          className="absolute rounded-sm wbc-confetti"
          style={{
            top:              "-20px",
            left:             `${p.left}%`,
            width:            `${p.size}px`,
            height:           `${p.size * 0.4}px`,
            backgroundColor:  p.color,
            transform:        `rotate(${p.rot}deg)`,
            animationDelay:   `${p.delay}s`,
            animationDuration:`${p.dur}s`,
            ["--drift" as string]: `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style jsx>{`
        @keyframes wbc-confetti-fall {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 100vh) rotate(720deg); opacity: 0; }
        }
        .wbc-confetti { animation: wbc-confetti-fall linear forwards; }
      `}</style>
    </div>
  );
}
