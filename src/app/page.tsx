import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Wellbeing Workbook – Noch in Aufbau",
  description:
    "Das Wellbeing Workbook ist aktuell noch in Aufbau. Schreib uns gern, wenn du wissen willst, was wir hier bauen.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-forest">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 h-20 sm:h-24 flex items-center justify-between">
          <a
            href="https://www.wellbeing-concepts.de"
            className="font-sans text-xs sm:text-sm tracking-[0.28em] text-sand hover:text-sand/80 transition-colors"
          >
            WELLBEING—CONCEPTS
          </a>
          <a
            href="https://www.wellbeing-concepts.de"
            className="hidden sm:inline-block font-sans text-sm text-sand underline underline-offset-[6px] decoration-sand/40 hover:decoration-sand transition-all"
          >
            Zur Hauptseite
          </a>
        </div>
      </header>

      {/* ── Main / Hero ──────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24 relative overflow-hidden">
        {/* Atmospheric background glow */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-sand/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sand/[0.04] blur-2xl" />
        </div>

        <div className="relative w-full max-w-3xl text-center">
          {/* Small label with lines */}
          <div className="flex items-center justify-center gap-4 mb-8 sm:mb-10">
            <span className="w-10 h-px bg-sand/60" />
            <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.32em] text-sand">
              Workbook · In Aufbau
            </span>
            <span className="w-10 h-px bg-sand/60" />
          </div>

          {/* Editorial serif headline, uppercase */}
          <h1 className="font-serif font-light text-5xl sm:text-6xl md:text-7xl lg:text-[88px] text-cream tracking-[0.01em] leading-[1.02] mb-8 sm:mb-10 text-balance">
            DIESER RAUM
            <br />
            <span className="text-sand italic font-normal">entsteht gerade.</span>
          </h1>

          {/* Body */}
          <p className="font-sans text-base sm:text-lg text-cream/70 leading-[1.75] max-w-xl mx-auto mb-10 sm:mb-14">
            Das Wellbeing Workbook ist aktuell noch nicht öffentlich zugänglich.
            Du bist neugierig, was wir hier bauen? Schreib uns gern —
            wir erzählen dir, was als Nächstes kommt.
          </p>

          {/* CTA pills — matching main site style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <a
              href="mailto:info@wellbeing-concepts.de?subject=Anfrage%20Wellbeing%20Workbook"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-sand/60 text-sand font-sans text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-sand/10 hover:border-sand transition-all"
            >
              Jetzt anfragen
            </a>
            <a
              href="https://www.wellbeing-concepts.de"
              className="inline-flex items-center justify-center h-12 px-6 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] text-cream/60 hover:text-sand transition-colors"
            >
              Mehr über uns
            </a>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-sand/15 bg-forest">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] sm:text-xs tracking-wider text-cream/40">
            © 2026 Wellbeing Concepts · Alle Rechte vorbehalten
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-sans text-[11px] sm:text-xs tracking-wider text-cream/35 hover:text-sand transition-colors"
          >
            <Lock className="w-3 h-3" strokeWidth={1.5} />
            Admin · Test-Login
          </Link>
        </div>
      </footer>

    </div>
  );
}
