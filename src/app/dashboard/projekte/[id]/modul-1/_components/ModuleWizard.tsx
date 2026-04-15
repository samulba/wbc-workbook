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
import { Step07 } from "./steps/Step07";
import { Step08 } from "./steps/Step08";
import { Step09 } from "./steps/Step09";
import { Step10 } from "./steps/Step10";
import { Step11 } from "./steps/Step11";
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
  const [step, setStep]       = useState(() => {
    const saved = initialData.current_step ?? 1;
    return Math.min(Math.max(saved, 1), TOTAL_STEPS);
  });
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

    const stepPayload = buildStepPayload(step, data);
    // Track furthest step reached (never go backwards in the DB counter)
    const payload = nextStep > step
      ? { ...stepPayload, current_step: Math.min(nextStep, TOTAL_STEPS) }
      : stepPayload;
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
          projectId={projectId}
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
        nextLabel={step === 9 ? "Prompt generieren" : undefined}
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
  projectId,
  projectName,
  roomName,
  roomType,
  onChange,
}: {
  step: number;
  data: Module1Data;
  projectId: string;
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
    case 7:
      return <Step07 data={data} />;
    case 8:
      return (
        <Step08
          data={data}
          roomType={roomType}
          roomName={roomName}
          onChange={onChange}
        />
      );
    case 9:
      return <Step09 data={data} />;
    case 10:
      return (
        <Step10
          data={data}
          roomType={roomType}
          roomName={roomName}
          onChange={onChange}
        />
      );
    case 11:
      return (
        <Step11
          data={data}
          projectId={projectId}
          projectName={projectName}
          roomType={roomType}
          roomName={roomName}
        />
      );
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
    case 7:
      return {}; // info-only step
    case 8:
      return {
        light_mood:       data.light_mood,
        special_elements: data.special_elements,
      };
    case 9:
      return {}; // info-only step
    case 10:
      return {
        moodboard_prompt: data.moodboard_prompt,
        moodboard_urls:   data.moodboard_urls,
      };
    case 11:
      return {
        status: "completed",
      };
    default:
      return {};
  }
}
