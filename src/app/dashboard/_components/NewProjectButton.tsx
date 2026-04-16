import Link from "next/link";
import { Plus } from "lucide-react";

interface Props {
  variant?: "empty" | "inline";
}

export function NewProjectButton({ variant = "inline" }: Props) {
  if (variant === "empty") {
    return (
      <Link
        href="/dashboard/projekte/neu"
        className="group w-full rounded-2xl border-2 border-dashed border-sand/50 hover:border-forest/30 hover:bg-white/60 transition-all duration-200 p-14 flex flex-col items-center gap-5 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-forest/6 group-hover:bg-forest/10 border border-forest/10 flex items-center justify-center transition-colors duration-200">
          <Plus className="w-7 h-7 text-forest/35 group-hover:text-forest/60 transition-colors duration-200" />
        </div>
        <div>
          <p className="font-headline text-2xl text-ink mb-2">
            Erstes Projekt starten
          </p>
          <p className="text-sm text-[#525252]/60 font-sans max-w-xs leading-relaxed">
            Beginne dein Raumkonzept – wähle einen Raum und arbeite dich
            Schritt für Schritt durch die Module.
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-2 bg-forest text-cream text-sm font-sans font-medium px-6 py-2.5 rounded-xl group-hover:bg-forest/90 transition-colors duration-200 shadow-warm-sm">
          <Plus className="w-4 h-4" />
          Neues Projekt starten
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/projekte/neu"
      className="inline-flex items-center gap-2 h-9 px-4 text-sm font-sans font-medium rounded-xl bg-forest text-cream hover:bg-forest/90 transition-colors duration-200 shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
    >
      <Plus className="w-4 h-4" />
      Neues Projekt
    </Link>
  );
}
