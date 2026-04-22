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
import { Step08 } from "./steps/Step08";
import { saveModule2Step, saveModule2Note } from "@/app/actions/module2";
import { STEP_CONFIG } from "@/lib/types/module2";
import type { Module2Data, Module2Partial } from "@/lib/types/module2";

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

export type Module2Carry = {
  mainEffect:      string | null;
  materials:       string[];
  specialElements: string;
};

interface Props {
  moduleId:    string;
  projectId:   string;
  roomId:      string;
  roomName:    string;
  roomType:    string;
  allRooms:    RoomSummary[];
  initialData: Module2Data;
  editMode?:   boolean;
  baseImage:   string | null;
  carry:       Module2Carry;
}

export function ModuleWizard({
  moduleId, projectId, roomId, roomName, roomType,
  allRooms, initialData, editMode = false, baseImage, carry,
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
                  `/dashboard/projekte/${projectId}/raum/${e.target.value}/modul-2${editMode ? "?edit=true" : ""}`
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
            Du bearbeitest dein Interior-Konzept – Änderungen werden beim Navigieren gespeichert.
          </p>
        </div>
      )}
    </>
  );

  return (
    <ModuleWizardShell<Module2Data>
      moduleId={moduleId}
      initialData={initialData}
      steps={STEP_CONFIG}
      editMode={editMode}
      header={header}
      saveStep={(id, payload) => saveModule2Step(id, payload as Module2Partial)}
      saveNotes={saveModule2Note}
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
          carry={carry}
          onChange={onChange}
        />
      )}
    />
  );
}

function StepContent({
  step, data, moduleId, projectId, roomId, roomName, roomType, baseImage, carry, onChange,
}: {
  step:      number;
  data:      Module2Data;
  moduleId:  string;
  projectId: string;
  roomId:    string;
  roomName:  string;
  roomType:  string;
  baseImage: string | null;
  carry:     Module2Carry;
  onChange:  (patch: Partial<Module2Data>) => void;
}) {
  switch (step) {
    case 1: return <Step01 data={data} onChange={onChange} />;
    case 2: return <Step02 data={data} onChange={onChange} />;
    case 3: return <Step03 data={data} onChange={onChange} />;
    case 4: return <Step04 data={data} onChange={onChange} />;
    case 5: return <Step05 data={data} onChange={onChange} />;
    case 6: return <Step06 data={data} onChange={onChange} />;
    case 7: return <Step07 data={data} onChange={onChange} />;
    case 8: return (
      <Step08
        data={data}
        moduleId={moduleId}
        projectId={projectId}
        roomId={roomId}
        roomName={roomName}
        roomType={roomType}
        baseImage={baseImage}
        carry={carry}
        onChange={onChange}
      />
    );
    default: return null;
  }
}

function buildStepPayload(step: number, data: Module2Data): Record<string, unknown> {
  switch (step) {
    case 1: return { preferred_styles: data.preferred_styles, rejected_styles: data.rejected_styles, primary_style: data.primary_style };
    case 2: return { palette_primary: data.palette_primary, palette_secondary: data.palette_secondary, palette_accent: data.palette_accent };
    case 3: return { width_cm: data.width_cm, length_cm: data.length_cm, height_cm: data.height_cm, floorplan_svg: data.floorplan_svg };
    case 4: return { zones: data.zones };
    case 5: return { furniture_keep: data.furniture_keep, furniture_remove: data.furniture_remove, furniture_wish: data.furniture_wish };
    case 6: return { furniture_favorites: data.furniture_favorites };
    case 7: return { layout_canvas: data.layout_canvas };
    case 8: return { render_urls: data.render_urls, render_prompt: data.render_prompt, status: "completed" };
    default: return {};
  }
}
