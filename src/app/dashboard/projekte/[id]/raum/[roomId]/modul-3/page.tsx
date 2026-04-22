import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModuleWizard } from "../../../modul-3/_components/ModuleWizard";
import { EMPTY_MODULE3_DATA } from "@/lib/types/module3";
import type { Module3Data } from "@/lib/types/module3";

export const metadata: Metadata = { title: "Modul 3 – Licht-Guide" };

export default async function RaumModul3Page({
  params,
  searchParams,
}: {
  params:       { id: string; roomId: string };
  searchParams: { edit?: string };
}) {
  const editMode = searchParams.edit === "true";
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, name,
      rooms (
        id, name, room_type, before_image_url, rendered_images,
        module3_analysis (*)
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type RoomRow = {
    id:                string;
    name:              string;
    room_type:         string;
    before_image_url:  string | null;
    rendered_images:   string[] | null;
    module3_analysis:  Module3Data[] | Module3Data | null;
  };

  const allRooms = (project.rooms as RoomRow[]) ?? [];
  const room     = allRooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const module3Raw: Module3Data | null = Array.isArray(room.module3_analysis)
    ? (room.module3_analysis[0] ?? null)
    : (room.module3_analysis as Module3Data | null);

  // Fallback if the trigger didn't run yet
  let m3Data = module3Raw;
  if (!m3Data) {
    const { data: newM3 } = await supabase
      .from("module3_analysis")
      .insert({ room_id: room.id })
      .select()
      .single();
    m3Data = newM3 as Module3Data | null;
  }

  if (!m3Data) notFound();

  const initialData: Module3Data = {
    ...EMPTY_MODULE3_DATA,
    ...m3Data,
  } as Module3Data;

  // Base image for the Light Temperature Studio: prefer latest AI render, then before photo
  const baseImage =
    (room.rendered_images && room.rendered_images[room.rendered_images.length - 1]) ??
    room.before_image_url ??
    null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back to project */}
      <Link
        href={`/dashboard/projekte/${project.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray/60 hover:text-forest transition-colors font-sans mb-6 sm:mb-10 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {project.name}
      </Link>

      {/* Module header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
        <span className="font-headline text-4xl sm:text-6xl text-mint/60 leading-none select-none">03</span>
        <div className="h-px flex-1 bg-sand/30" />
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">Modul 3</span>
      </div>

      <div className="max-w-2xl">
        <ModuleWizard
          moduleId={initialData.id}
          projectId={project.id}
          projectName={project.name}
          roomId={room.id}
          roomName={room.name}
          roomType={room.room_type}
          allRooms={allRooms.map((r) => ({ id: r.id, name: r.name, room_type: r.room_type }))}
          initialData={initialData}
          editMode={editMode}
          baseImage={baseImage}
        />
      </div>
    </div>
  );
}
