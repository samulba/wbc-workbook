import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModuleWizard } from "../../../modul-2/_components/ModuleWizard";
import { EMPTY_MODULE2_DATA } from "@/lib/types/module2";
import type { Module2Data } from "@/lib/types/module2";

export const metadata: Metadata = { title: "Modul 2 – Interior-Guide" };

export default async function RaumModul2Page({
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
        module2_analysis (*),
        module1_analysis ( primary_colors, secondary_colors, accent_color, materials, main_effect, special_elements )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type M1Carry = {
    primary_colors:   string[] | null;
    secondary_colors: string[] | null;
    accent_color:     string | null;
    materials:        string[] | null;
    main_effect:      string | null;
    special_elements: string | null;
  };

  type RoomRow = {
    id:                string;
    name:              string;
    room_type:         string;
    before_image_url:  string | null;
    rendered_images:   string[] | null;
    module2_analysis:  Module2Data[] | Module2Data | null;
    module1_analysis:  M1Carry[] | M1Carry | null;
  };

  const allRooms = (project.rooms as RoomRow[]) ?? [];
  const room     = allRooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const module2Raw: Module2Data | null = Array.isArray(room.module2_analysis)
    ? (room.module2_analysis[0] ?? null)
    : (room.module2_analysis as Module2Data | null);

  let m2Data = module2Raw;
  if (!m2Data) {
    const { data: newM2 } = await supabase
      .from("module2_analysis")
      .insert({ room_id: room.id })
      .select()
      .single();
    m2Data = newM2 as Module2Data | null;
  }

  if (!m2Data) notFound();

  // Pre-fill palette fields from M1 on first visit
  const m1: M1Carry | null = Array.isArray(room.module1_analysis)
    ? (room.module1_analysis[0] ?? null)
    : (room.module1_analysis as M1Carry | null);

  const initialData: Module2Data = {
    ...EMPTY_MODULE2_DATA,
    ...m2Data,
    palette_primary:   m2Data.palette_primary?.length   ? m2Data.palette_primary   : (m1?.primary_colors   ?? []),
    palette_secondary: m2Data.palette_secondary?.length ? m2Data.palette_secondary : (m1?.secondary_colors ?? []),
    palette_accent:    m2Data.palette_accent            ? m2Data.palette_accent    : (m1?.accent_color     ?? ""),
  } as Module2Data;

  const baseImage =
    (room.rendered_images && room.rendered_images[room.rendered_images.length - 1]) ??
    room.before_image_url ??
    null;

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
        <span className="font-headline text-4xl sm:text-6xl text-mint/60 leading-none select-none">02</span>
        <div className="h-px flex-1 bg-sand/30" />
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">Modul 2</span>
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
          baseImage={baseImage}
          carry={{
            mainEffect:      m1?.main_effect ?? null,
            materials:       m1?.materials ?? [],
            specialElements: m1?.special_elements ?? "",
          }}
        />
      </div>
    </div>
  );
}
