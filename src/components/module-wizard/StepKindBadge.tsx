import { MousePointer2, BookOpen, Eye } from "lucide-react";
import type { StepKind } from "./types";

export function StepKindBadge({ kind }: { kind: StepKind }) {
  const config = {
    interactive: {
      label: "Interaktiv",
      Icon:  MousePointer2,
      cls:   "bg-mint/20 text-forest border-mint/40",
    },
    learning: {
      label: "Zum Lernen",
      Icon:  BookOpen,
      cls:   "bg-sand/20 text-[#8a6030] border-sand/50",
    },
    review: {
      label: "Übersicht",
      Icon:  Eye,
      cls:   "bg-forest/10 text-forest border-forest/25",
    },
  }[kind];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium uppercase tracking-wider ${config.cls}`}>
      <config.Icon className="w-3 h-3" strokeWidth={1.75} />
      {config.label}
    </span>
  );
}
