"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteProject } from "@/app/actions/projects";
import { ArrowRight, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  entwurf:       { label: "Entwurf",       dot: "bg-sand",       badge: "bg-sand/25 text-[#7a5520] border-sand/40" },
  aktiv:         { label: "Aktiv",         dot: "bg-mint",       badge: "bg-mint/20 text-forest border-mint/30" },
  abgeschlossen: { label: "Abgeschlossen", dot: "bg-forest/50",  badge: "bg-forest/8 text-forest/60 border-forest/15" },
  archiviert:    { label: "Archiviert",    dot: "bg-gray/30",    badge: "bg-gray/10 text-gray/50 border-gray/20" },
};

const TOTAL_STEPS = 11;

export function ProjectCard({ project }: { project: ProjectCardProps }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  const statusCfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.entwurf;

  // Module 1 progress
  const m1 = project.rooms?.[0]?.module1_analysis?.[0];
  const m1Completed = m1?.status === "completed";
  const m1Step      = m1Completed ? TOTAL_STEPS : (m1?.current_step ?? 0);
  const m1Started   = m1Step > 0;
  const m1Pct       = Math.min(100, Math.round((m1Step / TOTAL_STEPS) * 100));

  const modul1Href = `/dashboard/projekte/${project.id}/modul-1`;

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

  // ── Delete confirmation overlay ─────────────────────────
  if (confirmDelete) {
    return (
      <div className="rounded-2xl bg-white/80 border-2 border-terracotta/30 p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-forest mb-1">
              Projekt löschen?
            </p>
            <p className="font-sans text-xs text-gray/60 leading-relaxed">
              <span className="font-medium text-forest/80">&ldquo;{project.name}&rdquo;</span> wird
              dauerhaft gelöscht. Alle Daten aus Modul 1 gehen verloren.
            </p>
          </div>
        </div>

        {deleteError && (
          <p className="text-xs text-terracotta font-sans bg-terracotta/5 rounded-lg px-3 py-2">
            {deleteError}
          </p>
        )}

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg border border-sand/40 bg-cream text-sm font-sans font-medium text-forest/70 hover:bg-sand/20 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg bg-terracotta text-sm font-sans font-medium text-white hover:bg-terracotta/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {isPending ? "Löschen …" : "Jetzt löschen"}
          </button>
        </div>
      </div>
    );
  }

  // ── Normal card ─────────────────────────────────────────
  return (
    <div className="group relative rounded-2xl bg-white/60 border border-sand/30 hover:border-mint/50 hover:shadow-sm transition-all overflow-hidden">

      {/* Top bar: status badge + delete */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-sans font-medium px-2.5 py-1 rounded-full border",
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
            "text-gray/30 hover:text-terracotta hover:bg-terracotta/8",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Clickable main area */}
      <Link href={modul1Href} className="block px-5 pt-3 pb-5">

        {/* Project name */}
        <h3 className="font-headline text-xl text-forest leading-snug mb-0.5 group-hover:text-forest/80 transition-colors">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs text-gray/55 font-sans line-clamp-1 mb-3">
            {project.description}
          </p>
        )}

        {/* Modul 1 progress */}
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-medium text-forest/60">Modul 1</span>
            {m1Completed ? (
              <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                Abgeschlossen
              </span>
            ) : m1Started ? (
              <span className="text-[11px] font-sans text-gray/50">
                Schritt {m1Step} / {TOTAL_STEPS}
              </span>
            ) : (
              <span className="text-[11px] font-sans text-gray/35 italic">Noch nicht gestartet</span>
            )}
          </div>

          {/* Progress track */}
          <div className="h-1.5 rounded-full bg-sand/30 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                m1Completed ? "bg-forest" : "bg-mint"
              )}
              style={{ width: `${m1Pct}%` }}
            />
          </div>
        </div>

        {/* Footer: date + arrow */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-[11px] text-gray/40 font-sans">{createdAt}</span>
          <span className={cn(
            "flex items-center gap-1 text-xs font-sans font-medium transition-all",
            "text-forest/30 group-hover:text-forest/60 group-hover:translate-x-0.5"
          )}>
            Öffnen
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </span>
        </div>
      </Link>
    </div>
  );
}
