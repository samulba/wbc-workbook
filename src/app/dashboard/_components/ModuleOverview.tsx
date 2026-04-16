const modules = [
  {
    number: "01",
    title: "Analyse & Vorbereitung",
    subtitle: "Modul 1",
    description:
      "Erkunde die gewünschte Raumwirkung, deine Farbwelt, Materialvorlieben und sammle erste Inspirationen für dein Moodboard.",
    topics: ["Raumwirkung", "Farbwelt", "Materialien", "Moodboard"],
    available: true,
    cardClass:   "border-mint/30 bg-white hover:shadow-warm-md hover:scale-[1.015]",
    numberClass: "text-mint/30",
    accentClass: "bg-mint/15 border-mint/25",
    badgeClass:  "bg-mint/20 text-forest border-mint/30",
  },
  {
    number: "02",
    title: "Interior-Guide",
    subtitle: "Modul 2",
    description:
      "Entwickle dein persönliches Einrichtungskonzept – von der Möbelauswahl bis zur stimmigen Gesamtkomposition.",
    topics: ["Möbelauswahl", "Stilfindung", "Raumplanung", "Komposition"],
    available: false,
    cardClass:   "border-sand/25 bg-white/70",
    numberClass: "text-sand/25",
    accentClass: "bg-sand/10 border-sand/20",
    badgeClass:  "bg-sand/15 text-sand border-sand/25",
  },
  {
    number: "03",
    title: "Licht-Guide",
    subtitle: "Modul 3",
    description:
      "Gestalte ein durchdachtes Lichtkonzept, das Atmosphäre schafft und die Raumwirkung gezielt unterstützt.",
    topics: ["Grundbeleuchtung", "Akzentlicht", "Stimmungslicht", "Lichtplanung"],
    available: false,
    cardClass:   "border-terracotta/15 bg-white/70",
    numberClass: "text-terracotta/20",
    accentClass: "bg-terracotta/8 border-terracotta/15",
    badgeClass:  "bg-terracotta/10 text-terracotta/60 border-terracotta/20",
  },
  {
    number: "04",
    title: "Sinnes-Guide",
    subtitle: "Modul 4",
    description:
      "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und das ganzheitliche Raumgefühl.",
    topics: ["Akustik", "Duft", "Haptik", "Raumgefühl"],
    available: false,
    cardClass:   "border-forest/15 bg-white/70",
    numberClass: "text-forest/20",
    accentClass: "bg-forest/6 border-forest/15",
    badgeClass:  "bg-forest/8 text-forest/50 border-forest/15",
  },
];

export function ModuleOverview() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-2xl text-ink">Die 4 Module</h2>
          <p className="text-sm text-[#525252]/60 font-sans mt-1">
            Dein vollständiger Weg zum ganzheitlichen Raumkonzept
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {modules.map((mod) => (
          <div
            key={mod.number}
            className={`relative rounded-2xl border overflow-hidden shadow-warm-sm transition-all duration-200 ${mod.cardClass} ${
              !mod.available && "opacity-60 cursor-not-allowed"
            }`}
          >
            {/* Watermark number */}
            <span
              className={`absolute -top-3 -right-2 font-headline text-[7rem] leading-none select-none pointer-events-none ${mod.numberClass}`}
              aria-hidden="true"
            >
              {mod.number}
            </span>

            <div className="relative p-6">
              {/* Subtitle + badge row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#525252]/45">
                  {mod.subtitle}
                </span>
                <span
                  className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${mod.badgeClass}`}
                >
                  {mod.available ? "Verfügbar" : "Demnächst"}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-headline text-xl text-ink mb-3 leading-snug">
                {mod.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#525252]/65 font-sans leading-relaxed mb-5">
                {mod.description}
              </p>

              {/* Topic pills */}
              <div className="flex flex-wrap gap-1.5">
                {mod.topics.map((topic) => (
                  <span
                    key={topic}
                    className={`text-[11px] font-sans text-[#525252]/55 px-2.5 py-1 rounded-full border ${mod.accentClass}`}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
