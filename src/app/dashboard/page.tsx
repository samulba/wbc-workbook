import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewProjectButton } from "./_components/NewProjectButton";
import { ProjectCard } from "./_components/ProjectCard";
import type { ProjectCardProps } from "./_components/ProjectCard";
import { ModuleOverview } from "./_components/ModuleOverview";
import { AchievementWidget } from "@/components/achievements/AchievementWidget";
import { ShoppingWidget } from "@/components/shopping/ShoppingWidget";

export const metadata: Metadata = { title: "Mein Raumkonzept" };

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: { user } }, { data: projects }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("projects")
      .select(`
        id, name, description, status, budget, deadline, created_at,
        rooms ( id, name, room_type, module1_analysis ( status, current_step ) )
      `)
      .order("created_at", { ascending: false }),
  ]);

  const firstName = user?.email?.split("@")[0]?.split(/[._-]/)[0] ?? null;
  const displayName = user?.user_metadata?.full_name ?? null;
  const greeting = displayName ?? (firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : null);

  type RoomForModal = { id: string; name: string; room_type: string };
  type ProjectForModal = { id: string; name: string; status: "entwurf" | "aktiv" | "abgeschlossen" | "archiviert"; rooms: RoomForModal[] | null };
  const projectsForModal: ProjectForModal[] = (projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status as ProjectForModal["status"],
    rooms: (p.rooms as (RoomForModal & { module1_analysis: unknown[] | null })[])?.map(({ id, name, room_type }) => ({ id, name, room_type })) ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative pt-10 sm:pt-14 pb-10 sm:pb-12 border-b border-[var(--border-page)] overflow-hidden">
        {/* Subtle warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream/25 via-transparent to-mint/5 pointer-events-none" />
        {/* Subtle deco bars */}
        <div className="absolute top-8 right-0 hidden md:flex gap-1.5 opacity-40">
          <div className="w-1 h-10 rounded-full bg-sand/40" />
          <div className="w-1 h-6 rounded-full bg-mint/50" />
          <div className="w-1 h-14 rounded-full bg-forest/20" />
          <div className="w-1 h-8 rounded-full bg-sand/30" />
        </div>

        <div className="relative">
          {greeting && (
            <p className="text-xs font-sans text-gray-400 uppercase tracking-[0.2em] mb-3">
              Willkommen zurück, {greeting}
            </p>
          )}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-gray-900 leading-[0.95] tracking-tight mb-3">
            Dein Raumkonzept
          </h1>
          <p className="text-gray-500 font-sans text-sm sm:text-base leading-relaxed max-w-md">
            Entwickle dein ganzheitliches Raumkonzept – von der ersten Idee bis zur fertigen Gestaltung.
          </p>
        </div>
      </section>

      {/* ── Projects ───────────────────────────────────────────── */}
      <section className="py-8 sm:py-10 border-b border-[var(--border-page)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-headline text-xl sm:text-2xl text-gray-900">
              Projekte
            </h2>
            <p className="text-sm text-gray-500 font-sans mt-0.5">
              {projects && projects.length > 0
                ? `${projects.length} ${projects.length === 1 ? "Projekt" : "Projekte"}`
                : "Noch kein Projekt angelegt"}
            </p>
          </div>
          {projects && projects.length > 0 && (
            <NewProjectButton variant="inline" />
          )}
        </div>

        {!projects || projects.length === 0 ? (
          <NewProjectButton variant="empty" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(projects as ProjectCardProps[]).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* ── Achievements + Shopping widgets ────────────────────── */}
      <section className="py-6 border-b border-[var(--border-page)] grid grid-cols-1 md:grid-cols-2 gap-4">
        <AchievementWidget />
        <ShoppingWidget />
      </section>

      {/* ── Module overview ────────────────────────────────────── */}
      <section className="py-8 sm:py-10 pb-16 sm:pb-20">
        <ModuleOverview projects={projectsForModal} />
      </section>

    </div>
  );
}
