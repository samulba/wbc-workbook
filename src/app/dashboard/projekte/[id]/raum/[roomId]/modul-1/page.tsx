import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModuleWizard } from "../../../modul-1/_components/ModuleWizard";
import { EMPTY_MODULE1_DATA } from "@/lib/types/module1";
import type { Module1Data } from "@/lib/types/module1";

export const metadata: Metadata = { title: "Modul 1 – Analyse & Vorbereitung" };

export default async function RaumModul1Page({
  params,
  searchParams,
}: {
  params: { id: string; roomId: string };
  searchParams: { edit?: string };
}) {
  const editMode = searchParams.edit === "true";
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load project + ALL rooms (for switcher) with m1 data for the specific room
  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, name,
      rooms (
        id, name, room_type, share_token, is_shared,
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
    share_token: string | null;
    is_shared: boolean;
    module1_analysis: Module1Data[] | null;
  };

  const allRooms = (project.rooms as RoomRow[]) ?? [];
  const room     = allRooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  // Supabase returns single object (not array) when FK has UNIQUE constraint
  const module1Raw: Module1Data | null = Array.isArray(room.module1_analysis)
    ? (room.module1_analysis[0] ?? null)
    : (room.module1_analysis as Module1Data | null);

  // Fallback: trigger might not have fired — create the record on the fly
  let m1Data = module1Raw;
  if (!m1Data) {
    const { data: newM1 } = await supabase
      .from("module1_analysis")
      .insert({ room_id: room.id })
      .select()
      .single();
    m1Data = newM1 as Module1Data | null;
  }

  if (!m1Data) notFound();

  const initialData: Module1Data = {
    ...EMPTY_MODULE1_DATA,
    ...m1Data,
    wishes: (m1Data!.wishes?.length === 3
      ? m1Data!.wishes
      : ["", "", ""]
    ) as [string, string, string],
  } as Module1Data;

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
        <span className="font-headline text-4xl sm:text-6xl text-mint/60 leading-none select-none">01</span>
        <div className="h-px flex-1 bg-sand/30" />
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">Modul 1</span>
      </div>

      {/* Wizard */}
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
          shareToken={room.share_token}
          isShared={room.is_shared}
        />
      </div>
    </div>
  );
}
