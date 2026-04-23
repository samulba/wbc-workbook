import type { Metadata } from "next";
import Link from "next/link";
import { Home, Search, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Seite nicht gefunden – Wellbeing Workbook",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="relative w-full max-w-lg">
        {/* Decorative SVG background — two overlapping circles like the brand mark */}
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="absolute inset-0 -z-10 w-full h-full opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="145" cy="200" r="110" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest" />
          <circle cx="255" cy="200" r="110" fill="none" stroke="currentColor" strokeWidth="2" className="text-sand" />
        </svg>

        <div className="relative rounded-3xl bg-white/85 backdrop-blur-sm border border-sand/30 shadow-warm-sm p-8 sm:p-12 text-center">
          {/* Big 404 */}
          <p
            className="font-headline text-7xl sm:text-8xl text-forest/20 leading-none select-none mb-2"
            style={{ letterSpacing: "-0.05em" }}
          >
            404
          </p>

          {/* Icon */}
          <div className="w-12 h-12 mx-auto rounded-2xl bg-forest/8 border border-forest/15 flex items-center justify-center mb-5">
            <Compass className="w-5 h-5 text-forest/60" strokeWidth={1.5} />
          </div>

          {/* Copy */}
          <h1 className="font-headline text-2xl sm:text-3xl text-forest mb-2">
            Hier ist nichts zu Hause
          </h1>
          <p className="text-sm sm:text-base text-gray/65 font-sans leading-relaxed mb-8 max-w-sm mx-auto">
            Die Seite, die du suchst, gibt es entweder nicht mehr oder wurde umgezogen. Kein
            Grund zur Sorge – zurück zum Dashboard, und es geht weiter mit deinem Raumkonzept.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-forest text-cream text-sm font-sans font-medium hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" strokeWidth={1.75} />
              Zum Dashboard
            </Link>
            <Link
              href="/dashboard/projekte"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-sand/40 bg-white text-sm font-sans font-medium text-forest hover:border-forest/40 hover:bg-mint/5 transition-colors"
            >
              <Search className="w-4 h-4" strokeWidth={1.75} />
              Projekte ansehen
            </Link>
          </div>

          {/* Back hint */}
          <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-sand font-sans">
            Wenn du hier bist, weil ein Link nicht mehr funktioniert –
            <Link href="/dashboard/einstellungen" className="underline underline-offset-2 ml-1 hover:text-forest transition-colors">
              Feedback geben
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
