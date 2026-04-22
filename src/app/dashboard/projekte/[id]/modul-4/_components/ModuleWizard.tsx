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
import { Step01 } from "./steps/Step01";
import { Step02 } from "./steps/Step02";
import { Step03 } from "./steps/Step03";
import { Step04 } from "./steps/Step04";
import { Step05 } from "./steps/Step05";
import { Step06 } from "./steps/Step06";
import { saveModule4Step, saveModule4Note } from "@/app/actions/module4";
import { STEP_CONFIG } from "@/lib/types/module4";
import type { Module4Data, Module4Partial } from "@/lib/types/module4";

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

type RoomSummary = { id: string; name: string; room_type: string };

interface Props {
  moduleId:    string;
  projectId:   string;
  roomId:      string;
  roomName:    string;
  roomType:    string;
  allRooms:    RoomSummary[];
  initialData: Module4Data;
  editMode?:   boolean;
}

export function ModuleWizard({
  moduleId, projectId, roomId, roomName, roomType,
  allRooms, initialData, editMode = false,
}: Props) {
  const router    = useRouter();
  const RoomIcon  = ROOM_ICONS[roomType] ?? Home;
  const roomLabel = ROOM_LABELS[roomType] ?? roomType;

  const header = (
    <>
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
                  `/dashboard/projekte/${projectId}/raum/${e.target.value}/modul-4${editMode ? "?edit=true" : ""}`
                )
              }
              className="text-xs font-sans text-gray-600 bg-transparent outline-none cursor-pointer border-b border-gray-200 py-0.5 max-w-[130px]"
              aria-label="Raum wechseln"
            >
              {allRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {editMode && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-mint/12 border border-mint/25">
          <Pencil className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70 leading-relaxed">
            Du bearbeitest dein Sinnes-Konzept – Änderungen werden beim Navigieren gespeichert.
          </p>
        </div>
      )}
    </>
  );

  return (
    <ModuleWizardShell<Module4Data>
      moduleId={moduleId}
      initialData={initialData}
      steps={STEP_CONFIG}
      editMode={editMode}
      header={header}
      saveStep={(id, payload) => saveModule4Step(id, payload as Module4Partial)}
      saveNotes={saveModule4Note}
      buildStepPayload={buildStepPayload}
      onComplete={() => router.push(`/dashboard/projekte/${projectId}/raum/${roomId}/zusammenfassung`)}
      renderStep={({ step, data, onChange }) => (
        <StepContent step={step} data={data} onChange={onChange} />
      )}
    />
  );
}

function StepContent({
  step, data, onChange,
}: {
  step:     number;
  data:     Module4Data;
  onChange: (patch: Partial<Module4Data>) => void;
}) {
  switch (step) {
    case 1: return <Step01 />;
    case 2: return <Step02 data={data} onChange={onChange} />;
    case 3: return <Step03 data={data} onChange={onChange} />;
    case 4: return <Step04 data={data} onChange={onChange} />;
    case 5: return <Step05 data={data} onChange={onChange} />;
    case 6: return <Step06 data={data} />;
    default: return null;
  }
}

function buildStepPayload(step: number, data: Module4Data): Record<string, unknown> {
  switch (step) {
    case 1: return {};
    case 2: return { reverb_level: data.reverb_level, acoustic_measures: data.acoustic_measures };
    case 3: return { scent_method: data.scent_method, scent_notes: data.scent_notes, plant_suggestions: data.plant_suggestions };
    case 4: return { preferred_materials: data.preferred_materials, rejected_materials: data.rejected_materials };
    case 5: return { rituals: data.rituals };
    case 6: return { status: "completed" };
    default: return {};
  }
}
