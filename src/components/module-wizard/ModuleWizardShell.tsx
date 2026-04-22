"use client";

import { useState, useCallback } from "react";
import { ProgressBar } from "./ProgressBar";
import { StepNav } from "./StepNav";
import { StepNotePanel } from "./StepNotePanel";
import { StepKindBadge } from "./StepKindBadge";
import type { StepDefinition, ModuleWizardDataBase, SaveResult } from "./types";

interface Props<TData extends ModuleWizardDataBase> {
  moduleId:         string;
  initialData:      TData;
  steps:            ReadonlyArray<StepDefinition>;
  renderStep:       (args: { step: number; data: TData; onChange: (patch: Partial<TData>) => void }) => React.ReactNode;
  buildStepPayload: (step: number, data: TData) => Record<string, unknown>;
  saveStep:         (moduleId: string, payload: Record<string, unknown>) => Promise<SaveResult>;
  saveNotes:        (moduleId: string, notes: Record<string, string>) => Promise<SaveResult>;
  onComplete:       () => void;
  header?:          React.ReactNode;
  editMode?:        boolean;
  nextLabelFor?:    (step: number) => string | undefined;
}

export function ModuleWizardShell<TData extends ModuleWizardDataBase>({
  moduleId,
  initialData,
  steps,
  renderStep,
  buildStepPayload,
  saveStep,
  saveNotes,
  onComplete,
  header,
  editMode = false,
  nextLabelFor,
}: Props<TData>) {
  const total = steps.length;

  const [step,    setStep]    = useState(() => {
    const saved = initialData.current_step ?? 1;
    return Math.min(Math.max(saved, 1), total);
  });
  const [visible, setVisible] = useState(true);
  const [data,    setData]    = useState<TData>(initialData);
  const [saving,  setSaving]  = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const handleChange = useCallback((patch: Partial<TData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setSavedAt(null);
  }, []);

  async function transition(nextStep: number) {
    setSaving(true);

    const stepPayload = buildStepPayload(step, data);
    const payload = nextStep > step
      ? { ...stepPayload, current_step: Math.min(nextStep, total) }
      : stepPayload;
    const result = await saveStep(moduleId, payload);

    setSaving(false);

    if (!result.ok) {
      setSavedAt(null);
      return;
    }

    setSavedAt(result.savedAt);

    if (nextStep < 1) return;

    if (nextStep > total) {
      onComplete();
      return;
    }

    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  }

  const currentConfig = steps[step - 1];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-24 sm:pb-0">

      {header}

      {/* Sticky on mobile so progress stays visible while scrolling */}
      <div className="sticky top-14 -mx-4 sm:-mx-0 sm:static z-10 bg-[var(--bg-page)]/95 backdrop-blur-md px-4 sm:px-0 py-2 sm:py-0 border-b border-[var(--border-page)] sm:border-0">
        <ProgressBar
          steps={steps}
          currentStep={step}
          stepNotes={data.step_notes}
          editMode={editMode}
          onStepClick={(s) => transition(s)}
        />
      </div>

      {/* Step header */}
      <div className={`transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <div className="flex flex-wrap items-center gap-2.5 mb-2">
          <p className="text-xs font-sans uppercase tracking-[0.2em] text-sand">
            {currentConfig?.subtitle}
          </p>
          {currentConfig && <StepKindBadge kind={currentConfig.kind} />}
        </div>
        <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl text-forest leading-tight">
          {currentConfig?.title}
        </h2>
      </div>

      {/* Step content */}
      <div className={`transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        {renderStep({ step, data, onChange: handleChange })}
        <StepNotePanel
          moduleId={moduleId}
          stepNumber={step}
          allNotes={data.step_notes ?? {}}
          onNotesChange={(notes) => handleChange({ step_notes: notes } as Partial<TData>)}
          saveNotes={saveNotes}
        />
      </div>

      <StepNav
        currentStep={step}
        totalSteps={total}
        saving={saving}
        savedAt={savedAt}
        editMode={editMode}
        nextLabel={nextLabelFor?.(step)}
        onBack={() => transition(step - 1)}
        onNext={() => transition(step + 1)}
      />
    </div>
  );
}
