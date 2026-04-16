import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewProjectButton } from "./_components/NewProjectButton";
import { ProjectCard } from "./_components/ProjectCard";
import type { ProjectCardProps } from "./_components/ProjectCard";
import { ModuleOverview } from "./_components/ModuleOverview";

export const metadata: Metadata = { title: "Mein Raumkonzept" };

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: { user } }, { data: projects }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("projects")
      .select(`
        id, name, description, status, budget, deadline, created_at,
        rooms ( id, module1_analysis ( status, current_step ) )
      `)
      .order("created_at", { ascending: false }),
  ]);

  const firstName = user?.email?.split("@")[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 md:py-20 border-b border-sand/25">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            {firstName && (
              <p className="text-xs font-sans text-sand uppercase tracking-[0.25em] mb-3 sm:mb-4">
                Willkommen zurück, {firstName}
              </p>
            )}
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-ink leading-[0.95] tracking-tight">
              Dein
              <br />
              <span className="text-forest">Raumkonzept</span>
            </h1>
            <p className="mt-4 text-[#525252]/80 font-sans text-sm sm:text-base leading-relaxed max-w-sm">
              Entwickle Schritt für Schritt dein ganzheitliches Raumkonzept –
              von der ersten Idee bis zur fertigen Gestaltung.
            </p>
          </div>

          {/* Decorative accent — hidden on mobile */}
          <div className="hidden md:flex gap-2 shrink-0 pb-1">
            <div className="w-2 h-20 rounded-full bg-mint/70" />
            <div className="w-2 h-12 rounded-full bg-sand/60 self-end" />
            <div className="w-2 h-16 rounded-full bg-terracotta/50 self-center" />
            <div className="w-2 h-9  rounded-full bg-forest/25 self-start" />
          </div>
        </div>
      </section>

      {/* ── Projects ───────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 border-b border-sand/25">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-headline text-xl sm:text-2xl text-ink">
              Deine Projekte
            </h2>
            <p className="text-sm text-[#525252]/60 font-sans mt-0.5">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {(projects as ProjectCardProps[]).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* ── Module overview ────────────────────────────────────── */}
      <section className="py-8 sm:py-12 pb-16 sm:pb-20">
        <ModuleOverview />
      </section>

    </div>
  );
}
