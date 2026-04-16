import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddRoomForm } from "./_components/AddRoomForm";

export const metadata: Metadata = { title: "Neuen Raum hinzufügen" };

export default async function AddRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back */}
      <Link
        href={`/dashboard/projekte/${project.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {project.name}
      </Link>

      {/* Header */}
      <div className="max-w-md">
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-gray-400 mb-2">
          {project.name}
        </p>
        <h1 className="font-headline text-3xl sm:text-4xl text-gray-900 mb-2 leading-tight">
          Neuen Raum hinzufügen
        </h1>
        <p className="text-sm text-gray-500 font-sans leading-relaxed mb-8">
          Jeder Raum erhält sein eigenes Modul-1-Konzept. Du kannst beliebig viele Räume zu einem Projekt hinzufügen.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <AddRoomForm projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
