const modules = [
  {
    number: "01",
    title: "Analyse & Vorbereitung",
    subtitle: "Modul 1",
    description:
      "Erkunde die gewünschte Raumwirkung, deine Farbwelt, Materialvorlieben und sammle erste Inspirationen für dein Moodboard.",
    topics: ["Raumwirkung", "Farbwelt", "Materialien", "Moodboard"],
    available: true,
    color: "border-mint/50 bg-mint/5",
    numberColor: "text-mint",
    badgeClass: "bg-mint/20 text-forest",
  },
  {
    number: "02",
    title: "Interior-Guide",
    subtitle: "Modul 2",
    description:
      "Entwickle dein persönliches Einrichtungskonzept – von der Möbelauswahl bis zur stimmigen Gesamtkomposition.",
    topics: ["Möbelauswahl", "Stilfindung", "Raumplanung", "Komposition"],
    available: false,
    color: "border-sand/30 bg-sand/5",
    numberColor: "text-sand",
    badgeClass: "bg-sand/20 text-sand",
  },
  {
    number: "03",
    title: "Licht-Guide",
    subtitle: "Modul 3",
    description:
      "Gestalte ein durchdachtes Lichtkonzept, das Atmosphäre schafft und die Raumwirkung gezielt unterstützt.",
    topics: ["Grundbeleuchtung", "Akzentlicht", "Stimmungslicht", "Lichtplanung"],
    available: false,
    color: "border-terracotta/20 bg-terracotta/5",
    numberColor: "text-terracotta/60",
    badgeClass: "bg-terracotta/10 text-terracotta/60",
  },
  {
    number: "04",
    title: "Sinnes-Guide",
    subtitle: "Modul 4",
    description:
      "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und das ganzheitliche Raumgefühl.",
    topics: ["Akustik", "Duft", "Haptik", "Raumgefühl"],
    available: false,
    color: "border-forest/20 bg-forest/5",
    numberColor: "text-forest/40",
    badgeClass: "bg-forest/10 text-forest/40",
  },
];

export function ModuleOverview() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-headline text-2xl text-forest">Die 4 Module</h2>
          <p className="text-sm text-gray/60 font-sans mt-1">
            Dein vollständiger Weg zum ganzheitlichen Raumkonzept
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <div
            key={mod.number}
            className={`relative rounded-2xl border p-6 transition-all ${mod.color} ${
              mod.available
                ? "hover:shadow-sm"
                : "opacity-70"
            }`}
          >
            {/* Number + availability */}
            <div className="flex items-start justify-between mb-4">
              <span className={`font-headline text-5xl leading-none ${mod.numberColor}`}>
                {mod.number}
              </span>
              <span
                className={`text-xs font-sans font-medium px-2.5 py-1 rounded-full ${mod.badgeClass}`}
              >
                {mod.available ? "Verfügbar" : "Demnächst"}
              </span>
            </div>

            {/* Title */}
            <p className="text-xs text-gray/50 font-sans uppercase tracking-widest mb-1">
              {mod.subtitle}
            </p>
            <h3 className="font-headline text-xl text-forest mb-3 leading-snug">
              {mod.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray/70 font-sans leading-relaxed mb-4">
              {mod.description}
            </p>

            {/* Topic pills */}
            <div className="flex flex-wrap gap-1.5">
              {mod.topics.map((topic) => (
                <span
                  key={topic}
                  className="text-xs font-sans text-gray/50 bg-white/50 px-2 py-0.5 rounded-full border border-sand/20"
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* Lock overlay for unavailable */}
            {!mod.available && (
              <div className="absolute inset-0 rounded-2xl cursor-not-allowed" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
