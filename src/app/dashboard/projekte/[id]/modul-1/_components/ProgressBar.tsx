import { STEP_CONFIG } from "@/lib/types/module1";
import { cn } from "@/lib/utils";

interface Props {
  currentStep: number; // 1-based
  editMode?: boolean;
  onStepClick?: (step: number) => void;
}

export function ProgressBar({ currentStep, editMode, onStepClick }: Props) {
  const pct = Math.round((currentStep / STEP_CONFIG.length) * 100);

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">

        {/* Mobile left: dropdown in edit mode, plain label otherwise */}
        {editMode ? (
          <select
            value={currentStep}
            onChange={(e) => onStepClick?.(Number(e.target.value))}
            className="sm:hidden text-xs font-sans text-sand bg-transparent outline-none cursor-pointer border-b border-sand/35 py-0.5 max-w-[200px]"
          >
            {STEP_CONFIG.map(({ step, title }) => (
              <option key={step} value={step}>
                Schritt {step}: {title}
              </option>
            ))}
          </select>
        ) : (
          <span className="sm:hidden text-xs font-sans uppercase tracking-[0.2em] text-sand">
            Schritt {currentStep} / {STEP_CONFIG.length}
          </span>
        )}

        {/* Desktop left: always plain label */}
        <span className="hidden sm:block text-xs font-sans uppercase tracking-[0.2em] text-sand">
          Schritt {currentStep} / {STEP_CONFIG.length}
        </span>

        {/* Right: current step title */}
        <span className="text-xs font-sans text-gray/50 hidden sm:block truncate max-w-[200px]">
          {STEP_CONFIG[currentStep - 1]?.title}
        </span>
      </div>

      {/* Mobile: simple progress bar */}
      <div className="h-1 rounded-full bg-sand/25 overflow-hidden sm:hidden">
        <div
          className="h-full rounded-full bg-forest transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Desktop: dot/segment track */}
      <div className="hidden sm:flex items-center gap-1">
        {STEP_CONFIG.map(({ step, title }) => {
          const done   = step < currentStep;
          const active = step === currentStep;

          if (editMode && onStepClick) {
            return (
              <button
                key={step}
                type="button"
                title={`Zu Schritt ${step}: ${title}`}
                onClick={() => onStepClick(step)}
                className="flex-1 group"
              >
                <div
                  className={cn(
                    "rounded-full transition-all duration-200",
                    active && "h-2 w-full bg-forest",
                    done   && "h-1.5 w-full bg-mint group-hover:bg-forest/50 group-hover:h-2",
                    !active && !done && "h-1.5 w-full bg-sand/30 group-hover:bg-sand/60 group-hover:h-2"
                  )}
                />
              </button>
            );
          }

          return (
            <div key={step} className="flex-1">
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  active && "h-2 w-full bg-forest",
                  done   && "h-1.5 w-full bg-mint",
                  !active && !done && "h-1.5 w-full bg-sand/30"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Edit mode hint under bar — desktop only */}
      {editMode && (
        <p className="hidden sm:block text-[10px] text-sand/60 font-sans mt-1.5">
          Klicke auf einen Abschnitt, um direkt zu diesem Schritt zu springen
        </p>
      )}
    </div>
  );
}
