import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";
import { AmbientParallax } from "@/components/landing/AmbientParallax";

export const metadata: Metadata = {
  title: "Wellbeing Workbook – Noch in Aufbau",
  description:
    "Das Wellbeing Workbook ist aktuell noch in Aufbau. Schreib uns gern, wenn du wissen willst, was wir hier bauen.",
};

const PILLARS = ["Analyse", "Konzept", "Umsetzung", "Erlebnis"] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-forest text-cream relative overflow-hidden">

      {/* ── Static background layers ────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_95%)]" />
        {/* Faint grid — hints at "being built" */}
        <div
          className="absolute inset-0 opacity-[0.05] animate-drift"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(var(--sand)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--sand)) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Cursor-following ambient glows ──────────────────────── */}
      <AmbientParallax />

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="relative z-10 animate-fade-up">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 h-20 sm:h-24 flex items-center justify-between">
          <a
            href="https://www.wellbeing-concepts.de"
            className="font-sans text-xs sm:text-sm tracking-[0.28em] text-sand hover:text-sand/80 transition-colors"
          >
            WELLBEING—CONCEPTS
          </a>
          <a
            href="https://www.wellbeing-concepts.de"
            className="hidden sm:inline-flex items-center gap-1.5 font-sans text-sm text-sand underline underline-offset-[6px] decoration-sand/40 hover:decoration-sand transition-all"
          >
            Zur Hauptseite
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="relative w-full max-w-6xl">

          {/* Decorative rotating brand seal */}
          <div
            aria-hidden
            className="hidden md:block absolute -top-10 -right-4 lg:-right-8 w-64 h-64 lg:w-[22rem] lg:h-[22rem] animate-float"
          >
            {/* Rotating layer: rings + circular text */}
            <div className="absolute inset-0 animate-spin-slow">
              <svg viewBox="0 0 320 320" className="w-full h-full">
                <defs>
                  <path
                    id="sealCircle"
                    d="M 160,160 m -128,0 a 128,128 0 1,1 256,0 a 128,128 0 1,1 -256,0"
                  />
                </defs>
                <circle cx="160" cy="160" r="150" fill="none" stroke="rgb(var(--sand) / 0.45)" strokeWidth="0.6" />
                <circle cx="160" cy="160" r="128" fill="none" stroke="rgb(var(--sand) / 0.55)" strokeWidth="0.6" />
                <circle cx="160" cy="160" r="102" fill="none" stroke="rgb(var(--sand) / 0.35)" strokeWidth="0.6" />
                <text fill="rgb(var(--sand) / 0.75)" className="font-sans" style={{ fontSize: 11, letterSpacing: "0.38em" }}>
                  <textPath href="#sealCircle" startOffset="0%">
                    WELLBEING WORKBOOK · RÄUME · DIE · WIRKEN · EST · 2026 ·
                  </textPath>
                </text>
                {/* Ornamental ticks around the outer ring */}
                {Array.from({ length: 36 }).map((_, i) => {
                  const angle = (i * 10 * Math.PI) / 180;
                  const x1 = 160 + Math.cos(angle) * 152;
                  const y1 = 160 + Math.sin(angle) * 152;
                  const x2 = 160 + Math.cos(angle) * 146;
                  const y2 = 160 + Math.sin(angle) * 146;
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="rgb(var(--sand) / 0.35)"
                      strokeWidth={i % 3 === 0 ? 1.2 : 0.6}
                    />
                  );
                })}
              </svg>
            </div>
            {/* Stable inner monogram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <span className="font-serif text-4xl lg:text-5xl text-sand tracking-[0.15em] leading-none">
                  WBC
                </span>
                <span className="font-sans text-[9px] lg:text-[10px] tracking-[0.32em] text-sand/60 uppercase">
                  Workbook
                </span>
              </div>
            </div>
          </div>

          {/* ── Content ───────────────────────────────────────── */}
          <div className="relative text-center md:text-left md:max-w-3xl">

            {/* Label */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-8 animate-fade-up">
              <span className="w-10 h-px bg-sand/70" />
              <span className="font-sans text-[11px] uppercase tracking-[0.32em] text-sand">
                Workbook · In Aufbau
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif font-light text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[0.005em] mb-6 sm:mb-8 animate-fade-up-delay">
              <span className="block text-cream">EIN RAUM,</span>
              <span className="block text-cream">DER GERADE</span>
              <span className="block italic font-normal shimmer-gold">
                entsteht.
              </span>
            </h1>

            {/* Body */}
            <p className="font-sans text-base sm:text-lg text-cream/70 leading-[1.75] max-w-xl mx-auto md:mx-0 mb-10 sm:mb-12 animate-fade-up-slow">
              Unser Workbook ist noch nicht öffentlich zugänglich — wir gestalten
              gerade jeden Schritt so sorgfältig wie einen Raum.
              Du bist neugierig, was hier entsteht? Schreib uns gern.
            </p>

            {/* Marquee pillar strip — always moving */}
            <div
              className="relative mb-10 sm:mb-14 overflow-hidden animate-fade-up-slow"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
              }}
            >
              <div className="flex w-max animate-marquee">
                {[...PILLARS, ...PILLARS, ...PILLARS, ...PILLARS].map((p, i) => (
                  <span key={i} className="flex items-center gap-8 pr-8">
                    <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.32em] text-cream/55 whitespace-nowrap">
                      {p}
                    </span>
                    <span aria-hidden className="w-1 h-1 rounded-full bg-sand/60 shrink-0" />
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 sm:gap-5 animate-fade-up-slow">
              <a
                href="mailto:info@wellbeing-concepts.de?subject=Anfrage%20Wellbeing%20Workbook"
                className="group relative inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border border-sand/60 text-sand font-sans text-xs sm:text-sm uppercase tracking-[0.22em] overflow-hidden hover:border-sand transition-colors"
              >
                <span className="absolute inset-0 bg-sand/0 group-hover:bg-sand/10 transition-colors" />
                <span className="relative z-10">Jetzt anfragen</span>
                <ArrowUpRight
                  className="relative z-10 w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                />
              </a>
              <a
                href="https://www.wellbeing-concepts.de"
                className="inline-flex items-center justify-center h-12 px-6 font-sans text-xs sm:text-sm uppercase tracking-[0.22em] text-cream/60 hover:text-sand transition-colors"
              >
                Mehr über uns
              </a>
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-sand/15">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 py-6 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] sm:text-xs tracking-wider text-cream/40">
            © 2026 Wellbeing Concepts · Alle Rechte vorbehalten
          </p>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline-flex items-center gap-2.5 font-sans text-[10px] uppercase tracking-[0.28em] text-cream/45">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-sand animate-ring-out" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sand" />
              </span>
              Launch demnächst
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-sans text-[11px] sm:text-xs tracking-wider text-cream/40 hover:text-sand transition-colors"
            >
              <Lock className="w-3 h-3" strokeWidth={1.5} />
              Admin · Test-Login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
