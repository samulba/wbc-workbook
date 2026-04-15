import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModuleWizard } from "./_components/ModuleWizard";
import type { Module1Data } from "@/lib/types/module1";

export const metadata: Metadata = { title: "Modul 1 – Analyse & Vorbereitung" };

const EMPTY_DATA: Omit<Module1Data, "id" | "room_id"> = {
  wishes:           ["", "", ""],
  support_friends:  false,
  support_external: false,
  support_person:   "",
  current_issues:   "",
  more_of:          "",
  less_of:          "",
  change_reason:    "",
  main_effect:      null,
  desired_effects:  [],
  current_situation:"",
  color_preferences:[],
  color_avoid:      [],
  color_notes:      "",
  material_preferences: [],
  material_avoid:   [],
  material_notes:   "",
  moodboard_urls:   [],
  moodboard_notes:  "",
  notes:            "",
};

export default async function Modul1Page({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load project + rooms + module1 in one query
  const { data: project } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      rooms (
        id,
        name,
        room_type,
        module1_analysis (*)
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type RoomRow = {
    id: string;
    name: string;
    room_type: string;
    module1_analysis: Module1Data[] | null;
  };
  const room = (project.rooms as RoomRow[])?.[0];
  if (!room) notFound();

  const module1Raw = room.module1_analysis?.[0];
  if (!module1Raw) notFound();

  // Merge DB data over empty defaults (handles missing columns gracefully)
  const initialData: Module1Data = {
    ...EMPTY_DATA,
    ...module1Raw,
    wishes: (module1Raw.wishes?.length === 3
      ? module1Raw.wishes
      : ["", "", ""]
    ) as [string, string, string],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray/60 hover:text-forest transition-colors font-sans mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Module header */}
      <div className="flex items-center gap-4 mb-10">
        <span className="font-headline text-6xl text-mint/60 leading-none select-none">01</span>
        <div className="h-px flex-1 bg-sand/30" />
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">
          Modul 1
        </span>
      </div>

      {/* Wizard – max width for comfortable reading */}
      <div className="max-w-2xl">
        <ModuleWizard
          moduleId={initialData.id}
          projectId={project.id}
          projectName={project.name}
          roomName={room.name}
          roomType={room.room_type}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
