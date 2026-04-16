"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteRoom } from "@/app/actions/projects";
import {
  CheckCircle2, ArrowRight, Trash2, AlertTriangle,
  Home, Sofa, Moon, Monitor, Star, Droplets,
  ChefHat, UtensilsCrossed, DoorOpen, Package,
  Briefcase, Leaf, Sparkles, Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

export type RoomCardData = {
  id: string;
  name: string;
  room_type: string;
  module1_analysis: { status: string | null; current_step: number | null }[] | null;
};

interface Props {
  room: RoomCardData;
  projectId: string;
  canDelete: boolean;
}

const TOTAL_STEPS = 11;

export function RoomCard({ room, projectId, canDelete }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  const m1          = room.module1_analysis?.[0];
  const m1Completed = m1?.status === "completed";
  const m1Step      = m1Completed ? TOTAL_STEPS : (m1?.current_step ?? 0);
  const m1Started   = m1Step > 0;
  const m1Pct       = Math.min(100, Math.round((m1Step / TOTAL_STEPS) * 100));
  const RoomIcon    = ROOM_ICONS[room.room_type] ?? Home;
  const roomLabel   = ROOM_LABELS[room.room_type] ?? room.room_type;
  const href        = m1Completed
    ? `/dashboard/projekte/${projectId}/raum/${room.id}/modul-1?edit=true`
    : `/dashboard/projekte/${projectId}/raum/${room.id}/modul-1`;

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteRoom(room.id);
      if (result.ok) {
        router.refresh();
      } else {
        setDeleteError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  // ── Delete confirmation ──────────────────────────────────
  if (confirmDelete) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-white p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-gray-900 mb-0.5">Raum löschen?</p>
            <p className="font-sans text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">&ldquo;{room.name}&rdquo;</span> und alle
              Modul-1-Daten werden dauerhaft gelöscht.
            </p>
          </div>
        </div>
        {deleteError && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">
            {deleteError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-sm font-sans font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg bg-red-500 text-sm font-sans font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {isPending ? "Löschen …" : "Löschen"}
          </button>
        </div>
      </div>
    );
  }

  // ── Normal card ──────────────────────────────────────────
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors duration-150">

      {/* Delete button */}
      {canDelete && (
        <button
          type="button"
          title="Raum löschen"
          onClick={() => setConfirmDelete(true)}
          className={cn(
            "absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            "text-gray-300 hover:text-red-400 hover:bg-red-50",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      )}

      <Link href={href} className="flex items-center gap-4 px-4 py-3.5 pr-10">
        {/* Room icon */}
        <div className="w-9 h-9 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
          <RoomIcon className="w-4 h-4 text-forest/60" strokeWidth={1.5} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="min-w-0">
              <span className="text-sm font-sans font-semibold text-gray-900 truncate block leading-tight">
                {room.name}
              </span>
              <span className="text-xs text-gray-500 font-sans">{roomLabel}</span>
            </div>
            {m1Completed ? (
              <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest shrink-0 ml-3">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                Fertig
              </span>
            ) : m1Started ? (
              <span className="text-[11px] font-sans text-gray-400 shrink-0 ml-3">
                Schritt {m1Step}/{TOTAL_STEPS}
              </span>
            ) : (
              <span className="text-[11px] font-sans text-gray-400 italic shrink-0 ml-3">
                Nicht gestartet
              </span>
            )}
          </div>

          <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                m1Completed ? "bg-forest" : "bg-mint"
              )}
              style={{ width: `${m1Pct}%` }}
            />
          </div>
        </div>

        <ArrowRight
          className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0"
          strokeWidth={1.5}
        />
      </Link>
    </div>
  );
}
