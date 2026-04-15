"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface Props {
  variant?: "empty" | "inline";
}

export function NewProjectButton({ variant = "inline" }: Props) {
  const router = useRouter();

  if (variant === "empty") {
    return (
      <button
        onClick={() => router.push("/dashboard/projekte/neu")}
        className="group w-full rounded-2xl border-2 border-dashed border-sand/60 hover:border-mint hover:bg-mint/5 transition-all p-10 flex flex-col items-center gap-4 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-forest/5 group-hover:bg-mint/20 flex items-center justify-center transition-colors">
          <Plus className="w-6 h-6 text-forest/40 group-hover:text-forest transition-colors" />
        </div>
        <div>
          <p className="font-headline text-xl text-forest mb-1">
            Erstes Projekt starten
          </p>
          <p className="text-sm text-gray/70 font-sans max-w-xs">
            Beginne dein Raumkonzept – wähle einen Raum und arbeite dich Schritt
            für Schritt durch die Module.
          </p>
        </div>
        <span className="mt-2 inline-flex items-center gap-2 bg-forest text-cream text-sm font-sans font-medium px-5 py-2.5 rounded-lg group-hover:bg-forest/90 transition-colors">
          <Plus className="w-4 h-4" />
          Neues Projekt starten
        </span>
      </button>
    );
  }

  return (
    <Button
      onClick={() => router.push("/dashboard/projekte/neu")}
      size="lg"
      className="gap-2"
    >
      <Plus className="w-4 h-4" />
      Neues Projekt starten
    </Button>
  );
}
