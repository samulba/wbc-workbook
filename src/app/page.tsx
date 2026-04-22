import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Wellbeing Workbook – Noch in Aufbau",
  description:
    "Das Wellbeing Workbook ist aktuell noch in Aufbau. Schreib uns gern, wenn du wissen willst, was wir hier bauen.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">

      {/* ── Top bar: back to main site ───────────────────────────── */}
      <nav className="border-b border-sand/25">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <a
            href="https://www.wellbeing-concepts.de"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-gray/55 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            wellbeing-concepts.de
          </a>
          <span className="text-[10px] uppercase tracking-[0.22em] text-sand font-sans">
            Workbook
          </span>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-mint/10 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-sand/12 translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative w-full max-w-xl text-center">
          {/* Brand label */}
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-sand mb-6">
            Wellbeing Concepts
          </p>

          {/* Decorative bars */}
          <div aria-hidden className="hidden sm:flex justify-center gap-2 mb-10">
            <div className="w-1.5 h-10 rounded-full bg-mint" />
            <div className="w-1.5 h-7 rounded-full bg-sand self-end" />
            <div className="w-1.5 h-8 rounded-full bg-terracotta self-center" />
            <div className="w-1.5 h-5 rounded-full bg-forest/35 self-start" />
          </div>

          {/* Headline */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-forest leading-[1.05] tracking-tight mb-5 text-balance">
            Wellbeing Workbook
          </h1>

          {/* Status chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint/15 border border-mint/30 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-forest">
              Noch in Aufbau
            </span>
          </div>

          {/* Body */}
          <p className="font-sans text-base sm:text-lg text-gray/65 leading-relaxed max-w-md mx-auto mb-8">
            Dieses Workbook ist aktuell noch nicht öffentlich zugänglich.
            Du bist neugierig, was wir hier bauen? Schreib uns gern –
            wir erzählen dir mehr.
          </p>

          {/* Primary CTA: Kontakt */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <a
              href="mailto:info@wellbeing-concepts.de?subject=Anfrage%20Wellbeing%20Workbook"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-forest text-cream text-base font-sans font-medium rounded-xl hover:bg-forest/90 transition-colors shadow-warm-sm"
            >
              <Mail className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Jetzt anfragen
            </a>
            <a
              href="https://www.wellbeing-concepts.de"
              className="inline-flex items-center justify-center h-11 px-5 text-sm font-sans text-gray/55 hover:text-forest transition-colors"
            >
              Zur Hauptseite
            </a>
          </div>
        </div>
      </main>

      {/* ── Footer: discreet admin/test login ────────────────────── */}
      <footer className="border-t border-sand/25 py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-gray/40">
            © 2026 Wellbeing Concepts
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-sans text-gray/40 hover:text-forest transition-colors"
          >
            <Lock className="w-3 h-3" strokeWidth={1.5} />
            Admin · Test-Login
          </Link>
        </div>
      </footer>

    </div>
  );
}
