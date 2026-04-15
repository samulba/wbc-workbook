import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Modul 1 – Analyse & Vorbereitung" };

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

  // Load project + first room
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, rooms(id, name, room_type)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const rooms = project.rooms as { id: string; name: string; room_type: string }[];
  const room = rooms?.[0];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray/60 hover:text-forest transition-colors font-sans mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zum Dashboard
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-headline text-5xl text-mint leading-none">01</span>
          <div className="h-px flex-1 bg-sand/30" />
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">
            Modul 1
          </span>
        </div>
        <h1 className="font-headline text-4xl md:text-5xl text-forest leading-none mb-3">
          Analyse & Vorbereitung
        </h1>
        <p className="text-gray/70 font-sans text-base leading-relaxed max-w-lg">
          Lerne deinen Raum kennen. Definiere die gewünschte Wirkung, erkunde
          deine Farbwelt und sammle erste Inspirationen.
        </p>
      </div>

      {/* Project + Room info */}
      <div className="rounded-2xl border border-sand/30 bg-white/40 p-6 mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-sans uppercase tracking-widest text-sand mb-1">
            Dein Projekt
          </p>
          <p className="font-headline text-xl text-forest">{project.name}</p>
        </div>
        {room && (
          <>
            <div className="h-px sm:h-8 sm:w-px bg-sand/30" />
            <div className="flex-1">
              <p className="text-xs font-sans uppercase tracking-widest text-sand mb-1">
                Raum
              </p>
              <p className="font-headline text-xl text-forest">{room.name}</p>
            </div>
          </>
        )}
      </div>

      {/* Coming-soon sections preview */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            step: "1",
            title: "Raumwirkung",
            desc: "Welche Wirkung soll dein Raum auf dich und andere haben?",
            color: "border-mint/40 bg-mint/5",
            numColor: "text-mint",
            status: "Bereit",
            statusClass: "bg-mint/20 text-forest",
          },
          {
            step: "2",
            title: "Farbwelt",
            desc: "Deine persönliche Farbpalette – Lieblingsfarben und Töne, die du vermeidest.",
            color: "border-sand/40 bg-sand/5",
            numColor: "text-sand",
            status: "Bereit",
            statusClass: "bg-sand/20 text-sand",
          },
          {
            step: "3",
            title: "Materialien",
            desc: "Welche Oberflächen und Texturen fühlen sich für dich richtig an?",
            color: "border-terracotta/20 bg-terracotta/5",
            numColor: "text-terracotta/60",
            status: "Bereit",
            statusClass: "bg-terracotta/10 text-terracotta/60",
          },
          {
            step: "4",
            title: "Moodboard",
            desc: "Sammle visuelle Inspirationen und lade dein erstes Bildmaterial hoch.",
            color: "border-forest/20 bg-forest/5",
            numColor: "text-forest/40",
            status: "Bereit",
            statusClass: "bg-forest/10 text-forest/40",
          },
        ].map((section) => (
          <div
            key={section.step}
            className={`rounded-2xl border p-6 ${section.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`font-headline text-4xl leading-none ${section.numColor}`}>
                {section.step}
              </span>
              <span className={`text-xs font-sans font-medium px-2.5 py-1 rounded-full ${section.statusClass}`}>
                {section.status}
              </span>
            </div>
            <h3 className="font-headline text-xl text-forest mb-2">{section.title}</h3>
            <p className="text-sm text-gray/60 font-sans leading-relaxed">{section.desc}</p>
          </div>
        ))}
      </div>

      {/* Coming soon notice */}
      <div className="mt-10 rounded-2xl border border-dashed border-sand/50 p-6 text-center">
        <p className="font-headline text-lg text-forest mb-1">
          Die interaktiven Analyse-Formulare folgen im nächsten Schritt
        </p>
        <p className="text-sm text-gray/50 font-sans">
          Dein Projekt und dein Raum wurden erfolgreich angelegt.
        </p>
      </div>
    </div>
  );
}
