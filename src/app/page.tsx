import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileDown,
  Sparkles,
  CheckCircle2,
  Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Wellbeing Workbook – Räume, die wirken",
  description:
    "Entwickle Schritt für Schritt dein persönliches Raumkonzept – von der Analyse bis zur Umsetzung, mit geführten Modulen und KI-Unterstützung.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    number: "01",
    title: "Analyse & Vorbereitung",
    description:
      "Erkunde deine Wünsche, die gewünschte Raumwirkung, Farbwelt und Materialien – und erstelle dein erstes Moodboard.",
    topics: ["Raumwirkung", "Farbwelt", "Materialien", "Moodboard"],
    available: true,
    numberColor: "text-mint",
    border: "border-mint/40",
    bg: "bg-mint/5",
    badge: "bg-mint/20 text-forest",
  },
  {
    number: "02",
    title: "Interior-Guide",
    description:
      "Entwickle dein Einrichtungskonzept – von der Möbelauswahl bis zur stimmigen Gesamtkomposition.",
    topics: ["Möbelauswahl", "Stilfindung", "Raumplanung"],
    available: false,
    numberColor: "text-sand/60",
    border: "border-sand/25",
    bg: "bg-sand/5",
    badge: "bg-sand/20 text-sand",
  },
  {
    number: "03",
    title: "Licht-Guide",
    description:
      "Gestalte ein Lichtkonzept, das Atmosphäre schafft und die gewünschte Raumwirkung gezielt unterstützt.",
    topics: ["Grundbeleuchtung", "Akzentlicht", "Stimmungslicht"],
    available: false,
    numberColor: "text-terracotta/40",
    border: "border-terracotta/20",
    bg: "bg-terracotta/5",
    badge: "bg-terracotta/10 text-terracotta/60",
  },
  {
    number: "04",
    title: "Sinnes-Guide",
    description:
      "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und das ganzheitliche Raumgefühl.",
    topics: ["Akustik", "Duft", "Haptik"],
    available: false,
    numberColor: "text-forest/30",
    border: "border-forest/15",
    bg: "bg-forest/5",
    badge: "bg-forest/10 text-forest/40",
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Raum & Wünsche definieren",
    body: "Beschreibe deinen Raum und deine Vorstellungen. Das Workbook führt dich durch gezielte Fragen zur Raumwirkung, Farbe und Atmosphäre.",
  },
  {
    n: "2",
    title: "Schritt für Schritt gestalten",
    body: "Arbeite die Module in deinem eigenen Tempo durch. Dein Fortschritt wird automatisch gespeichert – du kannst jederzeit pausieren und weitermachen.",
  },
  {
    n: "3",
    title: "Raumidee exportieren",
    body: "Am Ende erhältst du ein vollständiges Raumkonzept als PDF – mit Farbwelt, Materialien, Lichtstimmung und deinem Moodboard.",
  },
];

const BENEFITS = [
  {
    Icon: BookOpen,
    title: "Geführt & strukturiert",
    body: "11 durchdachte Schritte führen dich von der ersten Idee bis zum fertigen Konzept – ohne Rätselraten.",
  },
  {
    Icon: Sparkles,
    title: "KI-unterstützt",
    body: "Erhalte einen maßgeschneiderten Moodboard-Prompt für ChatGPT oder Midjourney – generiert aus deinen Angaben.",
  },
  {
    Icon: FileDown,
    title: "Exportierbar",
    body: "Exportiere dein Raumkonzept als hochwertiges PDF – bereit für deine Planerin, deinen Handwerker oder einfach für dich.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Das Workbook hat mir endlich Klarheit gegeben. Ich wusste immer was ich nicht will – jetzt weiß ich auch, was ich will.",
    name: "Anna M.",
    role: "Interior-Enthusiastin",
  },
  {
    quote:
      "Der Moodboard-Prompt war so präzise, dass mein erstes generiertes Bild schon fast perfekt war. Ich war wirklich überrascht.",
    name: "Julia K.",
    role: "Yoga-Lehrerin & Studio-Besitzerin",
  },
  {
    quote:
      "Ich hätte nie gedacht, wie viel ein klares Farbkonzept ausmacht. Modul 1 hat mich komplett überzeugt.",
    name: "Sophie T.",
    role: "Projektmanagerin",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-sand/25">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none group">
            <span className="font-headline text-base sm:text-lg text-forest group-hover:text-forest/80 transition-colors">
              Wellbeing Workbook
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-sand font-sans hidden sm:block">
              Raumgestaltung
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="min-h-[44px] inline-flex items-center text-sm font-sans text-gray/60 hover:text-forest transition-colors px-2 hidden sm:inline-flex"
            >
              Anmelden
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 sm:px-5 bg-forest text-cream text-sm font-sans font-medium rounded-xl hover:bg-forest/90 transition-colors"
            >
              Registrieren
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32 relative overflow-hidden">
          {/* Subtle bg decoration */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-mint/8 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sand/12 translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Brand label */}
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-sand mb-6 sm:mb-8">
              Wellbeing Concepts · Raumgestaltung
            </p>

            {/* Decorative bars — hidden on small mobile */}
            <div aria-hidden className="hidden sm:flex justify-center gap-2.5 mb-10">
              <div className="w-1.5 h-14 rounded-full bg-mint" />
              <div className="w-1.5 h-9 rounded-full bg-sand self-end" />
              <div className="w-1.5 h-11 rounded-full bg-terracotta self-center" />
              <div className="w-1.5 h-7 rounded-full bg-forest/35 self-start" />
            </div>

            {/* Headline */}
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-forest leading-[1.05] tracking-tight mb-5 sm:mb-6 text-balance">
              Räume, die wirken.
              <br />
              <span className="text-mint">Wohlbefinden, das bleibt.</span>
            </h1>

            {/* Subtext */}
            <p className="font-sans text-base sm:text-lg md:text-xl text-gray/65 leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10">
              Entwickle Schritt für Schritt dein persönliches Raumkonzept –
              von der ersten Idee bis zur fertigen Gestaltung.
            </p>

            {/* CTAs — stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10 sm:mb-12 px-2 sm:px-0">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-forest text-cream text-base font-sans font-medium rounded-xl hover:bg-forest/90 transition-colors shadow-warm-sm"
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-12 px-6 text-base font-sans text-gray/60 hover:text-forest transition-colors"
              >
                Bereits registriert · Anmelden
              </Link>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-sans text-gray/45 uppercase tracking-wider">
              {["4 Module", "11 Schritte", "KI-Prompt", "PDF-Export"].map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0" strokeWidth={2} />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits strip ────────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-forest/5 border-y border-sand/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {BENEFITS.map(({ Icon, title, body }) => (
                <div key={title} className="flex flex-row sm:flex-col items-start gap-4">
                  <div className="w-11 h-11 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-forest/8 border border-forest/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-forest/60" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-headline text-base sm:text-lg text-forest mb-1.5 leading-snug">
                      {title}
                    </h3>
                    <p className="font-sans text-sm text-gray/65 leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Modules ───────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-sand mb-3">
                Der Weg zum Raumkonzept
              </p>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl text-forest mb-4 leading-tight">
                Die 4 Module
              </h2>
              <p className="font-sans text-gray/60 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                Vier aufeinander aufbauende Module führen dich zur ganzheitlichen Raumgestaltung.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {MODULES.map((mod) => (
                <div
                  key={mod.number}
                  className={`relative rounded-2xl border p-5 sm:p-6 ${mod.border} ${mod.bg} ${mod.available ? "hover:shadow-warm-sm transition-all" : "opacity-75"}`}
                >
                  {/* Number + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`font-headline text-4xl sm:text-5xl leading-none ${mod.numberColor}`}>
                      {mod.number}
                    </span>
                    <span className={`text-xs font-sans font-medium px-2.5 py-1 rounded-full ${mod.badge}`}>
                      {mod.available ? "Verfügbar" : "Demnächst"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-headline text-lg sm:text-xl text-forest mb-2 leading-snug">
                    {mod.title}
                  </h3>
                  <p className="font-sans text-sm text-gray/65 leading-relaxed mb-4">
                    {mod.description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5">
                    {mod.topics.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-sans text-gray/50 bg-white/60 px-2.5 py-1 rounded-full border border-sand/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {!mod.available && (
                    <div className="absolute inset-0 rounded-2xl cursor-default" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 bg-forest text-cream">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-mint/70 mb-3">
                So funktioniert es
              </p>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl text-cream mb-4 leading-tight">
                In 3 Schritten zum Raumkonzept
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
              {STEPS.map(({ n, title, body }) => (
                <div key={n} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 sm:w-9 sm:h-9 rounded-full border-2 border-mint/40 text-mint font-headline text-lg flex items-center justify-center shrink-0">
                      {n}
                    </span>
                    <div className="flex-1 h-px bg-mint/15" />
                  </div>
                  <h3 className="font-headline text-xl text-cream leading-snug">
                    {title}
                  </h3>
                  <p className="font-sans text-sm text-cream/60 leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-sand mb-3">
                Stimmen aus der Community
              </p>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl text-forest mb-4 leading-tight">
                Das sagen unsere Nutzerinnen
              </h2>
            </div>

            {/* Horizontal scroll on mobile, grid on sm+ */}
            <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
              {TESTIMONIALS.map(({ quote, name, role }, i) => (
                <div
                  key={i}
                  className="min-w-[280px] sm:min-w-0 rounded-2xl border border-sand/30 bg-white/50 p-5 sm:p-6 flex flex-col gap-4 shrink-0 sm:shrink"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5" aria-label="5 von 5 Sternen">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} viewBox="0 0 12 12" className="w-3.5 h-3.5 fill-sand">
                        <path d="M6 .5l1.39 2.82 3.11.45-2.25 2.19.53 3.1L6 7.5l-2.78 1.46.53-3.1L1.5 3.77l3.11-.45z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative flex-1">
                    <Quote
                      className="absolute -top-1 -left-1 w-5 h-5 text-mint/30"
                      strokeWidth={1.5}
                    />
                    <p className="font-sans text-sm text-gray/70 leading-relaxed pl-4 italic">
                      {quote}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="pt-3 border-t border-sand/20">
                    <p className="font-sans text-sm font-semibold text-forest">{name}</p>
                    <p className="font-sans text-xs text-gray/45">{role}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray/30 font-sans mt-5">
              Platzhalter-Testimonials · werden mit echten Nutzerstimmen ersetzt
            </p>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-br from-forest to-forest/90 relative overflow-hidden">
          {/* Decorative */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-mint/8 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-sand/10 -translate-x-1/3 translate-y-1/3" />
          </div>

          {/* Accent bar top */}
          <div aria-hidden className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-mint" />
            <div className="flex-1 bg-sand" />
            <div className="flex-1 bg-terracotta" />
            <div className="flex-1 bg-forest/60" />
          </div>

          <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-mint/70 mb-4 sm:mb-5">
              Bereit anfangen?
            </p>
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl text-cream mb-5 sm:mb-6 leading-tight">
              Dein Raumkonzept wartet.
            </h2>
            <p className="font-sans text-cream/60 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-sm mx-auto">
              Starte heute kostenlos und entwickle Schritt für Schritt deine persönliche Raumgestaltung.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-12 px-10 bg-mint text-forest text-base font-sans font-semibold rounded-xl hover:bg-mint/90 transition-colors shadow-md"
            >
              Jetzt kostenlos starten
              <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2} />
            </Link>
            <p className="mt-5 text-xs text-cream/35 font-sans">
              Kostenlos · Kein Abo · Jederzeit kündbar
            </p>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-sand/25 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 pb-8 border-b border-sand/20">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex flex-col leading-none mb-3">
                <span className="font-headline text-xl text-forest">Wellbeing Workbook</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-sand font-sans mt-0.5">
                  by Wellbeing Concepts
                </span>
              </Link>
              <p className="font-sans text-xs text-gray/50 max-w-[220px] leading-relaxed">
                Dein geführter Weg zu einem ganzheitlichen Raumkonzept.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12 sm:gap-8">
              <div className="flex flex-col gap-3">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-sand mb-1">
                  Produkt
                </p>
                <Link href="/signup" className="text-sm text-gray/60 hover:text-forest font-sans transition-colors min-h-[40px] flex items-center sm:min-h-0">
                  Registrieren
                </Link>
                <Link href="/login" className="text-sm text-gray/60 hover:text-forest font-sans transition-colors min-h-[40px] flex items-center sm:min-h-0">
                  Anmelden
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-sand mb-1">
                  Rechtliches
                </p>
                <Link href="/impressum" className="text-sm text-gray/60 hover:text-forest font-sans transition-colors min-h-[40px] flex items-center sm:min-h-0">
                  Impressum
                </Link>
                <Link href="/datenschutz" className="text-sm text-gray/60 hover:text-forest font-sans transition-colors min-h-[40px] flex items-center sm:min-h-0">
                  Datenschutzerklärung
                </Link>
                <Link href="/kontakt" className="text-sm text-gray/60 hover:text-forest font-sans transition-colors min-h-[40px] flex items-center sm:min-h-0">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-6">
            <p className="font-sans text-xs text-gray/40">
              © 2026 Wellbeing Concepts · Alle Rechte vorbehalten
            </p>
            <p className="font-sans text-xs text-gray/35">
              workbooks.wellbeing-concepts.de
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
