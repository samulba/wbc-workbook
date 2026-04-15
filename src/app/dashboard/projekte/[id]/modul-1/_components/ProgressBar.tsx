import { STEP_CONFIG } from "@/lib/types/module1";
import { cn } from "@/lib/utils";

interface Props {
  currentStep: number; // 1-based
}

export function ProgressBar({ currentStep }: Props) {
  return (
    <div className="w-full">
      {/* Step label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">
          Schritt {currentStep} von {STEP_CONFIG.length}
        </span>
        <span className="text-xs font-sans text-gray/50">
          {STEP_CONFIG[currentStep - 1]?.title}
        </span>
      </div>

      {/* Dot track */}
      <div className="flex items-center gap-1">
        {STEP_CONFIG.map(({ step }) => {
          const done    = step < currentStep;
          const active  = step === currentStep;
          return (
            <div key={step} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  active  && "h-2 w-full bg-forest",
                  done    && "h-1.5 w-full bg-mint",
                  !active && !done && "h-1.5 w-full bg-sand/30"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
