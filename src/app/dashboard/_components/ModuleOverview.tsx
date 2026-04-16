import { Modul1CardButton } from "./Modul1Modal";
import type { ProjectForModal } from "./Modul1Modal";

const modules = [
  {
    number: "01",
    title: "Analyse & Vorbereitung",
    subtitle: "Modul 1",
    description:
      "Erkunde die gewünschte Raumwirkung, deine Farbwelt, Materialvorlieben und erste Inspirationen für dein Moodboard.",
    topics: ["Raumwirkung", "Farbwelt", "Materialien", "Moodboard"],
    available: true,
    accentColor: "text-forest",
    dotColor:    "bg-forest",
    topicClass:  "bg-forest/5 text-forest/70 border-forest/10",
    badgeClass:  "bg-forest/8 text-forest border-forest/15",
    badgeLabel:  "Verfügbar",
    numberColor: "text-forest",
  },
  {
    number: "02",
    title: "Interior-Guide",
    subtitle: "Modul 2",
    description:
      "Entwickle dein persönliches Einrichtungskonzept – von der Möbelauswahl bis zur stimmigen Gesamtkomposition.",
    topics: ["Möbelauswahl", "Stilfindung", "Raumplanung", "Komposition"],
    available: false,
    accentColor: "text-gray-400",
    dotColor:    "bg-gray-300",
    topicClass:  "bg-gray-100 text-gray-400 border-gray-200",
    badgeClass:  "bg-gray-100 text-gray-400 border-gray-200",
    badgeLabel:  "Demnächst",
    numberColor: "text-gray-400",
  },
  {
    number: "03",
    title: "Licht-Guide",
    subtitle: "Modul 3",
    description:
      "Gestalte ein durchdachtes Lichtkonzept, das Atmosphäre schafft und die Raumwirkung gezielt unterstützt.",
    topics: ["Grundbeleuchtung", "Akzentlicht", "Stimmungslicht", "Lichtplanung"],
    available: false,
    accentColor: "text-gray-400",
    dotColor:    "bg-gray-300",
    topicClass:  "bg-gray-100 text-gray-400 border-gray-200",
    badgeClass:  "bg-gray-100 text-gray-400 border-gray-200",
    badgeLabel:  "Demnächst",
    numberColor: "text-gray-400",
  },
  {
    number: "04",
    title: "Sinnes-Guide",
    subtitle: "Modul 4",
    description:
      "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und das ganzheitliche Raumgefühl.",
    topics: ["Akustik", "Duft", "Haptik", "Raumgefühl"],
    available: false,
    accentColor: "text-gray-400",
    dotColor:    "bg-gray-300",
    topicClass:  "bg-gray-100 text-gray-400 border-gray-200",
    badgeClass:  "bg-gray-100 text-gray-400 border-gray-200",
    badgeLabel:  "Demnächst",
    numberColor: "text-gray-400",
  },
];

interface Props {
  projects: ProjectForModal[];
}

export function ModuleOverview({ projects }: Props) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="font-headline text-xl sm:text-2xl text-gray-900">Die 4 Module</h2>
        <p className="text-sm text-gray-500 font-sans mt-0.5">
          Dein vollständiger Weg zum ganzheitlichen Raumkonzept
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const inner = (
            <>
              {/* Watermark number */}
              <span
                className={`absolute bottom-3 right-4 font-headline text-[5rem] font-bold leading-none select-none pointer-events-none transition-opacity duration-200 opacity-[0.07] group-hover:opacity-[0.12] ${mod.numberColor}`}
              >
                {mod.number}
              </span>

              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${mod.dotColor}`} />
                  <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-gray-400">
                    {mod.subtitle}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border ${mod.badgeClass}`}
                >
                  {mod.badgeLabel}
                </span>
              </div>

              {/* Title */}
              <h3 className={`font-headline text-lg leading-snug mb-2 ${mod.accentColor}`}>
                {mod.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 font-sans leading-relaxed mb-4">
                {mod.description}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1.5">
                {mod.topics.map((topic) => (
                  <span
                    key={topic}
                    className={`text-[11px] font-sans px-2.5 py-1 rounded-full border ${mod.topicClass}`}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </>
          );

          if (mod.available) {
            return (
              <Modul1CardButton
                key={mod.number}
                projects={projects}
                cardClassName="group relative rounded-xl border bg-white p-5 text-left transition-all duration-200 border-[#e8e5e0] hover:border-forest/30 hover:shadow-warm-sm overflow-hidden block w-full"
              >
                {inner}
              </Modul1CardButton>
            );
          }

          return (
            <div
              key={mod.number}
              className="group relative rounded-xl border bg-white p-5 overflow-hidden border-[#e8e5e0] opacity-55"
              title="Demnächst verfügbar"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
