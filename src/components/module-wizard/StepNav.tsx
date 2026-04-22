import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  currentStep: number;
  totalSteps:  number;
  saving:      boolean;
  savedAt:     string | null;
  nextLabel?:  string;
  editMode?:   boolean;
  onBack:      () => void;
  onNext:      () => void;
}

export function StepNav({ currentStep, totalSteps, saving, savedAt, nextLabel, editMode, onBack, onNext }: Props) {
  const isLast = currentStep === totalSteps;

  return (
    <div className={cn(
      "flex items-center justify-between",
      // Mobile: fixed bottom bar with safe-area padding
      "fixed bottom-0 left-0 right-0 z-30",
      "px-4 py-3 bg-cream/97 backdrop-blur-md border-t border-sand/25 pb-safe",
      // Desktop: inline below step content
      "sm:static sm:z-auto sm:px-0 sm:pt-8 sm:pb-0 sm:bg-transparent sm:backdrop-blur-none sm:border-t sm:border-sand/30"
    )}>
      {/* Save indicator */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-gray/50 font-sans">
            <span className="w-3 h-3 rounded-full border-2 border-gray/40 border-t-transparent animate-spin shrink-0" />
            <span className="hidden sm:inline">Speichern …</span>
          </span>
        )}
        {!saving && savedAt && (
          <span className="flex items-center gap-1.5 text-xs text-mint font-sans">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Gespeichert {savedAt}</span>
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentStep > 1 && (
          <Button
            variant="ghost"
            size="md"
            onClick={onBack}
            disabled={saving}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={onNext}
          loading={saving}
          className="gap-1.5"
        >
          {isLast
            ? (editMode ? "Speichern & Zurück" : "Abschließen")
            : (nextLabel ?? "Weiter")}
          {!isLast && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
