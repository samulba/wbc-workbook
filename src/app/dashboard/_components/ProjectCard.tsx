import Link from "next/link";
import { cn } from "@/lib/utils";

type ProjectStatus = "entwurf" | "aktiv" | "abgeschlossen" | "archiviert";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  deadline: string | null;
  created_at: string;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  entwurf:       { label: "Entwurf",      className: "bg-sand/30 text-sand" },
  aktiv:         { label: "Aktiv",        className: "bg-mint/30 text-forest" },
  abgeschlossen: { label: "Abgeschlossen", className: "bg-forest/10 text-forest/60" },
  archiviert:    { label: "Archiviert",   className: "bg-gray/10 text-gray/60" },
};

export function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status] ?? statusConfig.entwurf;
  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/dashboard/projekte/${project.id}`}
      className="group block rounded-2xl bg-white/60 border border-sand/30 p-6 hover:border-mint/60 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-headline text-xl text-forest leading-snug group-hover:text-forest/80 transition-colors">
          {project.name}
        </h3>
        <span
          className={cn(
            "shrink-0 text-xs font-sans font-medium px-2.5 py-1 rounded-full",
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      {project.description && (
        <p className="text-sm text-gray/70 font-sans line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray/50 font-sans">
        {deadline && (
          <span>Deadline: {deadline}</span>
        )}
        {project.budget && (
          <span>Budget: {project.budget.toLocaleString("de-DE")} €</span>
        )}
      </div>
    </Link>
  );
}
