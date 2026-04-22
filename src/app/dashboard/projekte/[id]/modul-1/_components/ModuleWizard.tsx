"use client";

import { useRouter } from "next/navigation";
import {
  Pencil,
  Home, Sofa, Moon, Monitor, Star, Droplets,
  ChefHat, UtensilsCrossed, DoorOpen, Package,
  Briefcase, Leaf, Sparkles, Camera, ChevronsUpDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ModuleWizardShell } from "@/components/module-wizard";
import type { Module1Partial } from "@/lib/types/module1";
import { Step01 } from "./steps/Step01";
import { Step02 } from "./steps/Step02";
import { Step03 } from "./steps/Step03";
import { Step04 } from "./steps/Step04";
import { Step07 } from "./steps/Step07";
import { StepKiAnalyse } from "./steps/StepKiAnalyse";
import { StepPlaceholder } from "./steps/StepPlaceholder";
import { saveModule1Step, saveStepNote } from "@/app/actions/module1";
import { STEP_CONFIG } from "@/lib/types/module1";
import type { Module1Data } from "@/lib/types/module1";

// ── Room display config ────────────────────────────────────────────────────────

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const ROOM_ICONS: Record<string, LucideIcon> = {
  wohnzimmer: Sofa, schlafzimmer: Moon,
  arbeitszimmer: Monitor, kinderzimmer: Star,
  badezimmer: Droplets, kueche: ChefHat,
  esszimmer: UtensilsCrossed, flur: DoorOpen,
  keller: Package, buero: Briefcase,
  yogaraum: Leaf, wellness: Sparkles,
  studio: Camera, sonstiges: Home,
};

// ── Types ─────────────────────────────────────────────────────────────────────

type RoomSummary = { id: string; name: string; room_type: string };

interface Props {
  moduleId:     string;
  projectId:    string;
  projectName:  string;
  roomId:       string;
  roomName:     string;
  roomType:     string;
  allRooms:     RoomSummary[];
  initialData:  Module1Data;
  editMode?:    boolean;
  hasAnalysis?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ModuleWizard({
  moduleId,
  projectId,
  projectName,
  roomId,
  roomName,
  roomType,
  allRooms,
  initialData,
  editMode = false,
  hasAnalysis = false,
}: Props) {
  const router   = useRouter();
  const RoomIcon = ROOM_ICONS[roomType] ?? Home;
  const roomLabel = ROOM_LABELS[roomType] ?? roomType;

  const header = (
    <>
      {/* Room header */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <RoomIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-sans font-medium text-gray-700 truncate">{roomName}</span>
          <span className="text-xs text-gray-400 font-sans shrink-0">· {roomLabel}</span>
        </div>

        {allRooms.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <ChevronsUpDown className="w-3 h-3 text-gray-400" />
            <select
              value={roomId}
              onChange={(e) =>
                router.push(
                  `/dashboard/projekte/${projectId}/raum/${e.target.value}/modul-1${editMode ? "?edit=true" : ""}`
                )
              }
              className="text-xs font-sans text-gray-600 bg-transparent outline-none cursor-pointer border-b border-gray-200 py-0.5 max-w-[130px]"
              aria-label="Raum wechseln"
            >
              {allRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Edit mode banner */}
      {editMode && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-mint/12 border border-mint/25">
          <Pencil className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70 leading-relaxed">
            Du bearbeitest dein abgeschlossenes Konzept – Änderungen werden beim Navigieren gespeichert.
          </p>
        </div>
      )}
    </>
  );

  return (
    <ModuleWizardShell<Module1Data>
      moduleId={moduleId}
      initialData={initialData}
      steps={STEP_CONFIG}
      editMode={editMode}
      header={header}
      saveStep={(id, payload) => saveModule1Step(id, payload as Module1Partial)}
      saveNotes={saveStepNote}
      buildStepPayload={buildStepPayload}
      onComplete={() => router.push(`/dashboard/projekte/${projectId}/raum/${roomId}/zusammenfassung`)}
      renderStep={({ step, data, onChange }) => (
        <StepContent
          step={step}
          data={data}
          projectId={projectId}
          projectName={projectName}
          roomId={roomId}
          roomName={roomName}
          roomType={roomType}
          onChange={onChange}
          hasAnalysis={hasAnalysis}
        />
      )}
    />
  );
}

// ── Step router ───────────────────────────────────────────────────────────────
function StepContent({
  step,
  data,
  projectId,
  projectName,
  roomId,
  roomName,
  roomType,
  onChange,
  hasAnalysis,
}: {
  step:        number;
  data:        Module1Data;
  projectId:   string;
  projectName: string;
  roomId:      string;
  roomName:    string;
  roomType:    string;
  onChange:    (patch: Partial<Module1Data>) => void;
  hasAnalysis: boolean;
}) {
  switch (step) {
    case 1:
      return (
        <Step01
          data={data}
          projectName={projectName}
          roomName={roomName}
          roomType={roomType}
          projectId={projectId}
          roomId={roomId}
          onChange={onChange}
        />
      );
    case 2:
      return <Step02 data={data} onChange={onChange} />;
    case 3:
      return <Step03 />;
    case 4:
      return <Step04 data={data} roomType={roomType} onChange={onChange} />;
    case 5:
      return <Step07 data={data} />;
    case 6:
      return (
        <StepKiAnalyse
          projectId={projectId}
          roomId={roomId}
          hasAnalysis={hasAnalysis}
        />
      );
    default: {
      const config = STEP_CONFIG[step - 1];
      return config ? <StepPlaceholder step={config} /> : null;
    }
  }
}

// ── Payload builders ─────────────────────────────────────────────────────────
function buildStepPayload(step: number, data: Module1Data): Record<string, unknown> {
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
      return {};
    case 4:
      return { main_effect: data.main_effect };
    case 5:
      return {};
    case 6:
      return { status: "completed" };
    default:
      return {};
  }
}
