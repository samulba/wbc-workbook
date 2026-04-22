import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModuleWizard } from "../../../modul-4/_components/ModuleWizard";
import { EMPTY_MODULE4_DATA } from "@/lib/types/module4";
import type { Module4Data } from "@/lib/types/module4";

export const metadata: Metadata = { title: "Modul 4 – Sinnes-Guide" };

export default async function RaumModul4Page({
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
        id, name, room_type,
        module4_analysis (*)
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type RoomRow = {
    id:               string;
    name:             string;
    room_type:        string;
    module4_analysis: Module4Data[] | Module4Data | null;
  };

  const allRooms = (project.rooms as RoomRow[]) ?? [];
  const room     = allRooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const module4Raw: Module4Data | null = Array.isArray(room.module4_analysis)
    ? (room.module4_analysis[0] ?? null)
    : (room.module4_analysis as Module4Data | null);

  let m4Data = module4Raw;
  if (!m4Data) {
    const { data: newM4 } = await supabase
      .from("module4_analysis")
      .insert({ room_id: room.id })
      .select()
      .single();
    m4Data = newM4 as Module4Data | null;
  }
  if (!m4Data) notFound();

  const initialData: Module4Data = { ...EMPTY_MODULE4_DATA, ...m4Data } as Module4Data;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Link
        href={`/dashboard/projekte/${project.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray/60 hover:text-forest transition-colors font-sans mb-6 sm:mb-10 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {project.name}
      </Link>

      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
        <span className="font-headline text-4xl sm:text-6xl text-mint/60 leading-none select-none">04</span>
        <div className="h-px flex-1 bg-sand/30" />
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">Modul 4</span>
      </div>

      <div className="max-w-2xl">
        <ModuleWizard
          moduleId={initialData.id}
          projectId={project.id}
          roomId={room.id}
          roomName={room.name}
          roomType={room.room_type}
          allRooms={allRooms.map((r) => ({ id: r.id, name: r.name, room_type: r.room_type }))}
          initialData={initialData}
          editMode={editMode}
        />
      </div>
    </div>
  );
}
