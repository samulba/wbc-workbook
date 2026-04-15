import type { STEP_CONFIG } from "@/lib/types/module1";

type StepInfo = typeof STEP_CONFIG[number];

export function StepPlaceholder({ step }: { step: StepInfo }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <span className="font-headline text-6xl text-sand/40">{String(step.step).padStart(2, "0")}</span>
      <div>
        <p className="font-headline text-2xl text-forest/50 mb-2">{step.title}</p>
        <p className="text-sm text-gray/40 font-sans">{step.subtitle}</p>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-sand/40 px-6 py-3">
        <p className="text-xs text-gray/40 font-sans uppercase tracking-widest">Dieser Schritt folgt bald</p>
      </div>
    </div>
  );
}
