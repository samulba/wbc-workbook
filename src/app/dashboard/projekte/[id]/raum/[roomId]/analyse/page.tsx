import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnalyseClient } from "./_components/AnalyseClient";

export const metadata: Metadata = { title: "KI-Raumanalyse" };

export default async function AnalysePage({
  params,
}: {
  params: { id: string; roomId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load project + room + m1 data + existing analysis
  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, name,
      rooms (
        id, name, room_type, ai_analysis, ai_analysis_at,
        module1_analysis ( main_effect )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type RoomRow = {
    id: string; name: string; room_type: string;
    ai_analysis: string | null; ai_analysis_at: string | null;
    module1_analysis: { main_effect: string | null }[] | null;
  };

  const rooms = (project.rooms as RoomRow[]) ?? [];
  const room = rooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const mainEffect = room.module1_analysis?.[0]?.main_effect ?? null;

  // Remaining analyses for today
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_analysis_count, analysis_reset_date")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = !profile?.analysis_reset_date || profile.analysis_reset_date !== today;
  const usedToday = isNewDay ? 0 : (profile?.daily_analysis_count ?? 0);
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
            KI-Raumanalyse
          </p>
          <h1 className="font-headline text-2xl sm:text-3xl text-gray-900 leading-tight">
            {room.name}
          </h1>
        </div>
      </div>

      <AnalyseClient
        roomId={room.id}
        projectId={project.id}
        roomType={room.room_type}
        mainEffect={mainEffect}
        savedAnalysis={room.ai_analysis}
        savedAt={room.ai_analysis_at}
        remaining={remaining}
      />
    </div>
  );
}
