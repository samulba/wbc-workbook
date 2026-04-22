"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteProject } from "@/app/actions/projects";
import { ArrowRight, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CircleProgress } from "@/components/CircleProgress";

type ProjectStatus = "entwurf" | "aktiv" | "abgeschlossen" | "archiviert";

type Module1Info = {
  status: string | null;
  current_step: number | null;
};

type RoomInfo = {
  id: string;
  module1_analysis: Module1Info[] | null;
};

export type ProjectCardProps = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  deadline: string | null;
  created_at: string;
  rooms: RoomInfo[] | null;
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; dot: string; badge: string }> = {
  entwurf:       { label: "Entwurf",       dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200"   },
  aktiv:         { label: "Aktiv",         dot: "bg-forest",     badge: "bg-forest/8 text-forest border-forest/20"      },
  abgeschlossen: { label: "Abgeschlossen", dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200"     },
  archiviert:    { label: "Archiviert",    dot: "bg-gray-300",   badge: "bg-gray-50 text-gray-400 border-gray-200"      },
};

const TOTAL_STEPS = 6;

export function ProjectCard({ project }: { project: ProjectCardProps }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  const statusCfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.entwurf;

  // Progress from first room
  const rooms     = project.rooms ?? [];
  const roomCount = rooms.length;
  const m1 = rooms[0]?.module1_analysis?.[0];
  const m1Completed = m1?.status === "completed";
  const m1Step      = m1Completed ? TOTAL_STEPS : (m1?.current_step ?? 0);
  const m1Started   = m1Step > 0;
  const m1Pct       = Math.min(100, Math.round((m1Step / TOTAL_STEPS) * 100));

  const projectHref = `/dashboard/projekte/${project.id}`;

  const createdAt = new Date(project.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteProject(project.id);
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
      <div className="rounded-xl bg-white border-2 border-red-200 p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-gray-900 mb-1">
              Projekt löschen?
            </p>
            <p className="font-sans text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">&ldquo;{project.name}&rdquo;</span> wird
              dauerhaft gelöscht. Alle Modul-1-Daten gehen verloren.
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
    <div className="group relative rounded-xl bg-white border border-[var(--border-page)] hover:border-[#d4cfc9] dark:hover:border-[#444] hover:shadow-warm-sm transition-all duration-150 overflow-hidden">

      {/* Status + delete */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full border",
            statusCfg.badge
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
          {statusCfg.label}
        </span>
        <button
          type="button"
          title="Projekt löschen"
          onClick={() => setConfirmDelete(true)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            "text-gray-300 hover:text-red-400 hover:bg-red-50",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Main content */}
      <Link href={projectHref} className="block px-4 pt-3 pb-4">

        {/* Name + room count */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-headline text-lg text-gray-900 leading-snug">
            {project.name}
          </h3>
          <span className="shrink-0 text-[10px] font-sans text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full mt-0.5">
            {roomCount === 1 ? "1 Raum" : `${roomCount} Räume`}
          </span>
        </div>

        {project.description && (
          <p className="text-xs text-gray-500 font-sans line-clamp-1 mb-3">
            {project.description}
          </p>
        )}

        {/* Module 1 progress */}
        <div className="mt-3 flex items-center gap-3">
          <CircleProgress pct={m1Pct} size={38} stroke={3} labelSize="text-[9px]" />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-medium text-gray-500">Modul 1</span>
              {m1Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  Abgeschlossen
                </span>
              ) : m1Started ? (
                <span className="text-[11px] font-sans text-gray-400">
                  {m1Pct}% · Schritt {m1Step}/{TOTAL_STEPS}
                </span>
              ) : (
                <span className="text-[11px] font-sans text-gray-400 italic">Nicht gestartet</span>
              )}
            </div>
            <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  m1Completed ? "bg-forest" : m1Pct >= 50 ? "bg-forest/70" : "bg-mint"
                )}
                style={{ width: `${m1Pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-[11px] text-gray-400 font-sans">{createdAt}</span>
          <span className="flex items-center gap-1 text-xs font-sans font-medium text-gray-400 group-hover:text-forest transition-colors">
            Ansehen
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
          </span>
        </div>
      </Link>
    </div>
  );
}
