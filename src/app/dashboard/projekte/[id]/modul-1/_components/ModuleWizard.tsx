"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "./ProgressBar";
import { StepNav } from "./StepNav";
import { Step01 } from "./steps/Step01";
import { Step02 } from "./steps/Step02";
import { Step03 } from "./steps/Step03";
import { Step04 } from "./steps/Step04";
import { Step05 } from "./steps/Step05";
import { Step06 } from "./steps/Step06";
import { StepPlaceholder } from "./steps/StepPlaceholder";
import { saveModule1Step } from "@/app/actions/module1";
import { STEP_CONFIG, TOTAL_STEPS } from "@/lib/types/module1";
import type { Module1Data } from "@/lib/types/module1";

interface Props {
  moduleId: string;
  projectId: string;
  projectName: string;
  roomName: string;
  roomType: string;
  initialData: Module1Data;
}

export function ModuleWizard({
  moduleId,
  projectId,
  projectName,
  roomName,
  roomType,
  initialData,
}: Props) {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [visible, setVisible] = useState(true);
  const [data, setData]       = useState<Module1Data>(initialData);
  const [saving, setSaving]   = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const handleChange = useCallback((patch: Partial<Module1Data>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setSavedAt(null);
  }, []);

  async function transition(nextStep: number) {
    setSaving(true);

    const payload = buildStepPayload(step, data);
    const result  = await saveModule1Step(moduleId, payload);

    setSaving(false);

    if (!result.ok) {
      setSavedAt(null);
      return;
    }

    setSavedAt(result.savedAt);

    if (nextStep < 1) return;

    if (nextStep > TOTAL_STEPS) {
      router.push(`/dashboard/projekte/${projectId}`);
      return;
    }

    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  }

  const currentConfig = STEP_CONFIG[step - 1];

  return (
    <div className="flex flex-col gap-8">
      <ProgressBar currentStep={step} />

      {/* Step header */}
      <div className={`transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-sand mb-2">
          {currentConfig?.subtitle}
        </p>
        <h2 className="font-headline text-3xl md:text-4xl text-forest leading-tight">
          {currentConfig?.title}
        </h2>
      </div>

      {/* Step content */}
      <div className={`transition-all duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <StepContent
          step={step}
          data={data}
          projectName={projectName}
          roomName={roomName}
          roomType={roomType}
          onChange={handleChange}
        />
      </div>

      <StepNav
        currentStep={step}
        saving={saving}
        savedAt={savedAt}
        onBack={() => transition(step - 1)}
        onNext={() => transition(step + 1)}
      />
    </div>
  );
}

// ── Step router ───────────────────────────────────────────────────────────────
function StepContent({
  step,
  data,
  projectName,
  roomName,
  roomType,
  onChange,
}: {
  step: number;
  data: Module1Data;
  projectName: string;
  roomName: string;
  roomType: string;
  onChange: (patch: Partial<Module1Data>) => void;
}) {
  switch (step) {
    case 1:
      return (
        <Step01
          data={data}
          projectName={projectName}
          roomName={roomName}
          roomType={roomType}
          onChange={onChange}
        />
      );
    case 2:
      return <Step02 data={data} onChange={onChange} />;
    case 3:
      return <Step03 />;
    case 4:
      return <Step04 data={data} onChange={onChange} />;
    case 5:
      return <Step05 data={data} />;
    case 6:
      return <Step06 data={data} onChange={onChange} />;
    default: {
      const config = STEP_CONFIG[step - 1];
      return config ? <StepPlaceholder step={config} /> : null;
    }
  }
}

// ── Payload builders – only send fields for the active step ──────────────────
function buildStepPayload(step: number, data: Module1Data) {
  switch (step) {
    case 1:
      return {
        wishes:           data.wishes,
        support_friends:  data.support_friends,
        support_external: data.support_external,
        support_person:   data.support_person,
      };
    case 2:
      return {
        current_issues: data.current_issues,
        more_of:        data.more_of,
        less_of:        data.less_of,
        change_reason:  data.change_reason,
      };
    case 3:
      return {}; // info-only step
    case 4:
      return {
        main_effect: data.main_effect,
      };
    case 5:
      return {}; // info-only step
    case 6:
      return {
        primary_colors:   data.primary_colors,
        secondary_colors: data.secondary_colors,
        accent_color:     data.accent_color,
        materials:        data.materials,
      };
    default:
      return {};
  }
}
