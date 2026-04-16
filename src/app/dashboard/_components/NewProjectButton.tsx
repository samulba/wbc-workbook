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
        className="group w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-forest/30 hover:bg-white transition-all duration-200 py-14 px-8 flex flex-col items-center gap-5 text-center"
      >
        <div className="w-14 h-14 rounded-xl bg-gray-100 group-hover:bg-forest/8 border border-gray-200 group-hover:border-forest/20 flex items-center justify-center transition-all duration-200">
          <Plus className="w-6 h-6 text-gray-400 group-hover:text-forest/60 transition-colors duration-200" />
        </div>
        <div>
          <p className="font-headline text-xl text-gray-900 mb-1.5">
            Erstes Projekt starten
          </p>
          <p className="text-sm text-gray-500 font-sans max-w-xs leading-relaxed">
            Beginne dein Raumkonzept – wähle einen Raum und arbeite dich Schritt für Schritt durch die Module.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 bg-forest text-white text-sm font-sans font-medium px-5 py-2.5 rounded-lg hover:bg-forest/90 transition-colors duration-200">
          <Plus className="w-4 h-4" />
          Neues Projekt starten
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/projekte/neu"
      className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-sans font-medium rounded-lg bg-forest text-white hover:bg-forest/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
    >
      <Plus className="w-3.5 h-3.5" />
      Neues Projekt
    </Link>
  );
}
