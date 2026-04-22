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
import { Step07 } from "./steps/Step07";
import { saveModule3Step, saveModule3Note } from "@/app/actions/module3";
import { STEP_CONFIG } from "@/lib/types/module3";
import type { Module3Data, Module3Partial } from "@/lib/types/module3";

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
  moduleId:     string;
  projectId:    string;
  projectName?: string;
  roomId:       string;
  roomName:     string;
  roomType:     string;
  allRooms:     RoomSummary[];
  initialData:  Module3Data;
  editMode?:    boolean;
  baseImage:    string | null;
}

export function ModuleWizard({
  moduleId,
  projectId,
  roomId,
  roomName,
  roomType,
  allRooms,
  initialData,
  editMode = false,
  baseImage,
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
                  `/dashboard/projekte/${projectId}/raum/${e.target.value}/modul-3${editMode ? "?edit=true" : ""}`
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

      {editMode && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-mint/12 border border-mint/25">
          <Pencil className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70 leading-relaxed">
            Du bearbeitest dein Licht-Konzept – Änderungen werden beim Navigieren gespeichert.
          </p>
        </div>
      )}
    </>
  );

  return (
    <ModuleWizardShell<Module3Data>
      moduleId={moduleId}
      initialData={initialData}
      steps={STEP_CONFIG}
      editMode={editMode}
      header={header}
      saveStep={(id, payload) => saveModule3Step(id, payload as Module3Partial)}
      saveNotes={saveModule3Note}
      buildStepPayload={buildStepPayload}
      onComplete={() => router.push(`/dashboard/projekte/${projectId}`)}
      renderStep={({ step, data, onChange }) => (
        <StepContent
          step={step}
          data={data}
          moduleId={moduleId}
          projectId={projectId}
          roomId={roomId}
          roomName={roomName}
          roomType={roomType}
          baseImage={baseImage}
          onChange={onChange}
        />
      )}
    />
  );
}

function StepContent({
  step, data, moduleId, projectId, roomId, roomName, roomType, baseImage, onChange,
}: {
  step:      number;
  data:      Module3Data;
  moduleId:  string;
  projectId: string;
  roomId:    string;
  roomName:  string;
  roomType:  string;
  baseImage: string | null;
  onChange:  (patch: Partial<Module3Data>) => void;
}) {
  switch (step) {
    case 1: return <Step01 data={data} onChange={onChange} />;
    case 2: return <Step02 />;
    case 3: return <Step03 data={data} onChange={onChange} />;
    case 4: return <Step04 data={data} onChange={onChange} />;
    case 5: return (
      <Step05
        data={data}
        moduleId={moduleId}
        projectId={projectId}
        roomId={roomId}
        roomType={roomType}
        baseImage={baseImage}
        onChange={onChange}
      />
    );
    case 6: return <Step06 data={data} roomType={roomType} />;
    case 7: return <Step07 data={data} roomName={roomName} />;
    default: return null;
  }
}

function buildStepPayload(step: number, data: Module3Data): Record<string, unknown> {
  switch (step) {
    case 1: return { current_fixtures: data.current_fixtures, baseline_photo_url: data.baseline_photo_url };
    case 2: return {};
    case 3: return { window_orientation: data.window_orientation, daytime_usage: data.daytime_usage };
    case 4: return { preset: data.preset, light_mood: data.light_mood, light_warmth: data.light_warmth, light_brightness: data.light_brightness };
    case 5: return { light_warmth: data.light_warmth, light_brightness: data.light_brightness, studio_render_urls: data.studio_render_urls };
    case 6: return { lamp_favorites: data.lamp_favorites };
    case 7: return { scenarios: data.scenarios, status: "completed" };
    default: return {};
  }
}
