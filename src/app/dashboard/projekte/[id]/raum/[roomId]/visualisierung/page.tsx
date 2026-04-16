import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VisualisierungClient } from "./_components/VisualisierungClient";

export const metadata: Metadata = { title: "Raum visualisieren" };

export default async function VisualisierungPage({
  params,
}: {
  params: { id: string; roomId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load project + room + module1 data
  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, name,
      rooms (
        id, name, room_type, before_image_url, rendered_images,
        module1_analysis (
          id, status, current_step,
          main_effect, primary_colors, secondary_colors,
          accent_color, materials, light_mood, special_elements
        )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type RoomRow = {
    id: string; name: string; room_type: string;
    before_image_url: string | null;
    rendered_images: string[] | null;
    module1_analysis: {
      id: string;
      status: string | null; current_step: number | null;
      main_effect: string | null;
      primary_colors: string[] | null;
      secondary_colors: string[] | null;
      accent_color: string | null;
      materials: string[] | null;
      light_mood: string | null;
      special_elements: string | null;
    }[] | null;
  };

  const rooms = (project.rooms as RoomRow[]) ?? [];
  const room = rooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const m1 = room.module1_analysis?.[0] ?? null;
  const m1Step = m1?.status === "completed" ? 11 : (m1?.current_step ?? 0);

  // Remaining renderings for today
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_render_count, render_reset_date")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = !profile?.render_reset_date || profile.render_reset_date !== today;
  const usedToday = isNewDay ? 0 : (profile?.daily_render_count ?? 0);
  const remaining = Math.max(0, 3 - usedToday);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Back */}
      <Link
        href={`/dashboard/projekte/${project.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {project.name}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
          <span className="text-base font-headline text-forest/60">KI</span>
        </div>
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-sand mb-0.5">
            KI-Visualisierung
          </p>
          <h1 className="font-headline text-2xl sm:text-3xl text-gray-900 leading-tight">
            {room.name}
          </h1>
        </div>
      </div>

      <VisualisierungClient
        roomId={room.id}
        projectId={project.id}
        roomType={room.room_type}
        beforeImageUrl={room.before_image_url}
        savedRenderings={room.rendered_images ?? []}
        remaining={remaining}
        m1Step={m1Step}
        moduleId={m1?.id ?? null}
        mainEffect={m1?.main_effect ?? null}
        primaryColors={m1?.primary_colors ?? []}
        secondaryColors={m1?.secondary_colors ?? []}
        accentColor={m1?.accent_color ?? ""}
        materials={m1?.materials ?? []}
        lightMood={m1?.light_mood ?? ""}
        specialElements={m1?.special_elements ?? ""}
      />
    </div>
  );
}
