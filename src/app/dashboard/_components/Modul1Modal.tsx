"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X, Plus, ArrowRight,
  Home, Sofa, Moon, Monitor, Star, Droplets,
  ChefHat, UtensilsCrossed, DoorOpen, Package,
  Briefcase, Leaf, Sparkles, Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ROOM_ICONS: Record<string, LucideIcon> = {
  wohnzimmer: Sofa, schlafzimmer: Moon,
  arbeitszimmer: Monitor, kinderzimmer: Star,
  badezimmer: Droplets, kueche: ChefHat,
  esszimmer: UtensilsCrossed, flur: DoorOpen,
  keller: Package, buero: Briefcase,
  yogaraum: Leaf, wellness: Sparkles,
  studio: Camera, sonstiges: Home,
};

type ProjectStatus = "entwurf" | "aktiv" | "abgeschlossen" | "archiviert";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; dot: string; badge: string }> = {
  entwurf:       { label: "Entwurf",       dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200"  },
  aktiv:         { label: "Aktiv",         dot: "bg-forest",    badge: "bg-forest/8 text-forest border-forest/20"     },
  abgeschlossen: { label: "Abgeschlossen", dot: "bg-gray-400",  badge: "bg-gray-100 text-gray-600 border-gray-200"    },
  archiviert:    { label: "Archiviert",    dot: "bg-gray-300",  badge: "bg-gray-50 text-gray-400 border-gray-200"     },
};

export type ProjectForModal = {
  id: string;
  name: string;
  status: ProjectStatus;
  rooms: { id: string; name: string; room_type: string }[] | null;
};

export type ModuleNum = 1 | 2 | 3 | 4;

const MODULE_TITLES: Record<ModuleNum, string> = {
  1: "Modul 1 starten",
  2: "Modul 2 starten",
  3: "Modul 3 starten",
  4: "Modul 4 starten",
};

interface Modul1CardButtonProps {
  projects:      ProjectForModal[];
  children:      React.ReactNode;
  cardClassName?: string;
  moduleNum?:    ModuleNum;
}

export function Modul1CardButton({
  projects, children, cardClassName, moduleNum = 1,
}: Modul1CardButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cardClassName}
      >
        {children}
      </button>

      {open && (
        <Modul1Modal
          projects={projects}
          moduleNum={moduleNum}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function Modul1Modal({
  projects,
  moduleNum,
  onClose,
}: {
  projects:  ProjectForModal[];
  moduleNum: ModuleNum;
  onClose:   () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="font-headline text-xl text-gray-900">{MODULE_TITLES[moduleNum]}</h2>
              <p className="text-sm text-gray-500 font-sans mt-0.5">
                Wähle ein Projekt oder starte neu
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-0.5 -mr-1"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {projects.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-sm text-gray-400 font-sans mb-4">
                  Noch keine Projekte vorhanden
                </p>
                <Link
                  href="/dashboard/projekte/neu"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-forest text-white text-sm font-sans font-medium hover:bg-forest/90 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  Erstes Projekt starten
                </Link>
              </div>
            ) : (
              <>
                {/* Project list */}
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                  {projects.map((project) => {
                    const firstRoom = project.rooms?.[0];
                    const RoomIcon = firstRoom?.room_type
                      ? (ROOM_ICONS[firstRoom.room_type] ?? Home)
                      : Home;
                    const statusCfg =
                      STATUS_CONFIG[project.status] ?? STATUS_CONFIG.entwurf;

                    return (
                      <Link
                        key={project.id}
                        href={`/dashboard/projekte/${project.id}/modul-${moduleNum}`}
                        onClick={onClose}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-[var(--border-page)] hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-150"
                      >
                        {/* Room icon */}
                        <div className="w-9 h-9 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
                          <RoomIcon className="w-4 h-4 text-forest/60" strokeWidth={1.5} />
                        </div>

                        {/* Project info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-semibold text-gray-900 truncate leading-tight">
                            {project.name}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full border mt-0.5",
                              statusCfg.badge
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
                            {statusCfg.label}
                          </span>
                        </div>

                        <ArrowRight
                          className="w-4 h-4 text-gray-300 group-hover:text-forest group-hover:translate-x-0.5 transition-all shrink-0"
                          strokeWidth={1.5}
                        />
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-sans">oder</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* New project button */}
                <Link
                  href="/dashboard/projekte/neu"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-dashed border-gray-300 text-sm font-sans font-medium text-gray-600 hover:border-forest/40 hover:text-forest hover:bg-forest/[0.02] transition-all duration-150"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  Neues Projekt starten
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
