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
    <div className="mx-auto max-w-6xl px-6 lg:px-8">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 border-b border-sand/30">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            {firstName && (
              <p className="text-sm font-sans text-sand uppercase tracking-[0.2em] mb-3">
                Willkommen zurück, {firstName}
              </p>
            )}
            <h1 className="font-headline text-5xl md:text-6xl text-forest leading-none">
              Dein Raumkonzept
            </h1>
            <p className="mt-4 text-gray/70 font-sans text-lg leading-relaxed max-w-lg">
              Entwickle Schritt für Schritt dein ganzheitliches Raumkonzept –
              von der ersten Idee bis zur fertigen Gestaltung.
            </p>
          </div>

          {/* Decorative accent */}
          <div className="flex gap-2 shrink-0">
            <div className="w-2 h-16 rounded-full bg-mint" />
            <div className="w-2 h-10 rounded-full bg-sand self-end" />
            <div className="w-2 h-12 rounded-full bg-terracotta self-center" />
            <div className="w-2 h-8 rounded-full bg-forest/30 self-start" />
          </div>
        </div>
      </section>

      {/* ── Projects ───────────────────────────────────────────── */}
      <section className="py-10 border-b border-sand/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-headline text-2xl text-forest">
              Deine Projekte
            </h2>
            <p className="text-sm text-gray/60 font-sans mt-0.5">
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
          /* Empty state */
          <NewProjectButton variant="empty" />
        ) : (
          /* Project grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(projects as ProjectCardProps[]).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* ── Module overview ────────────────────────────────────── */}
      <section className="py-10 pb-16">
        <ModuleOverview />
      </section>

    </div>
  );
}
