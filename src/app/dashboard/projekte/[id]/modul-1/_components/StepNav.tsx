import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { TOTAL_STEPS } from "@/lib/types/module1";

interface Props {
  currentStep: number;
  saving: boolean;
  savedAt: string | null;
  onBack: () => void;
  onNext: () => void;
}

export function StepNav({ currentStep, saving, savedAt, onBack, onNext }: Props) {
  const isLast = currentStep === TOTAL_STEPS;

  return (
    <div className="flex items-center justify-between pt-8 border-t border-sand/30">
      {/* Save indicator */}
      <div className="flex items-center gap-2 min-w-[120px]">
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-gray/50 font-sans">
            <span className="w-3 h-3 rounded-full border-2 border-gray/40 border-t-transparent animate-spin" />
            Speichern …
          </span>
        )}
        {!saving && savedAt && (
          <span className="flex items-center gap-1.5 text-xs text-mint font-sans">
            <CheckCircle className="w-3.5 h-3.5" />
            Gespeichert {savedAt}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        {currentStep > 1 && (
          <Button
            variant="ghost"
            size="md"
            onClick={onBack}
            disabled={saving}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={onNext}
          loading={saving}
          className="gap-1.5"
        >
          {isLast ? "Abschließen" : "Weiter"}
          {!isLast && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
