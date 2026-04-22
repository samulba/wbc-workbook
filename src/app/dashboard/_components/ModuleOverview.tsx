import { Modul1CardButton } from "./Modul1Modal";
import type { ProjectForModal, ModuleNum } from "./Modul1Modal";

type ModuleDefinition = {
  number:      string;
  moduleNum:   ModuleNum;
  title:       string;
  subtitle:    string;
  description: string;
  topics:      string[];
};

const modules: ModuleDefinition[] = [
  {
    number:      "01",
    moduleNum:   1,
    title:       "Analyse & Vorbereitung",
    subtitle:    "Modul 1",
    description: "Erkunde die gewünschte Raumwirkung, verstehe deine Motivation und entscheide, welche Atmosphäre dein Raum ausstrahlen soll.",
    topics:      ["Wünsche", "Raumwirkung", "Hauptwirkung", "KI-Analyse"],
  },
  {
    number:      "02",
    moduleNum:   2,
    title:       "Interior-Guide",
    subtitle:    "Modul 2",
    description: "Entwickle dein persönliches Einrichtungskonzept – von der Stilfindung bis zur stimmigen Gesamtkomposition.",
    topics:      ["Stil-Tinder", "Farbwelt", "Möbel", "Layout"],
  },
  {
    number:      "03",
    moduleNum:   3,
    title:       "Licht-Guide",
    subtitle:    "Modul 3",
    description: "Gestalte ein durchdachtes Lichtkonzept, das Atmosphäre schafft und die Raumwirkung gezielt unterstützt.",
    topics:      ["Tageslicht", "Presets", "Light Studio", "Szenarien"],
  },
  {
    number:      "04",
    moduleNum:   4,
    title:       "Sinnes-Guide",
    subtitle:    "Modul 4",
    description: "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und tägliche Rituale.",
    topics:      ["Akustik", "Duft", "Haptik", "Rituale"],
  },
];

interface Props {
  projects: ProjectForModal[];
}

export function ModuleOverview({ projects }: Props) {
  const hasProjects = projects.length > 0;

  return (
    <section data-tour="modul-overview">
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
                className="absolute bottom-3 right-4 font-headline text-[5rem] font-bold leading-none select-none pointer-events-none transition-opacity duration-200 opacity-[0.07] group-hover:opacity-[0.12] text-forest"
              >
                {mod.number}
              </span>

              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest" />
                  <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-gray-400">
                    {mod.subtitle}
                  </span>
                </div>
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border bg-forest/8 text-forest border-forest/15">
                  Verfügbar
                </span>
              </div>

              {/* Title */}
              <h3 className="font-headline text-lg leading-snug mb-2 text-forest">
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
                    className="text-[11px] font-sans px-2.5 py-1 rounded-full border bg-forest/5 text-forest/70 border-forest/10"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </>
          );

          if (hasProjects) {
            return (
              <Modul1CardButton
                key={mod.number}
                projects={projects}
                moduleNum={mod.moduleNum}
                cardClassName="group relative rounded-xl border bg-white p-5 text-left transition-all duration-200 border-[var(--border-page)] hover:border-forest/30 hover:shadow-warm-sm overflow-hidden block w-full"
              >
                {inner}
              </Modul1CardButton>
            );
          }

          // No projects yet — render as static card with hint
          return (
            <div
              key={mod.number}
              className="group relative rounded-xl border bg-white p-5 overflow-hidden border-[var(--border-page)] opacity-75"
              title="Lege zuerst ein Projekt an"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
