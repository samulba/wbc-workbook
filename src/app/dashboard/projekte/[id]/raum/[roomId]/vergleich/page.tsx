import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff, Camera } from "lucide-react";
import { BeforeAfterSlider } from "./_components/BeforeAfterSlider";

export const metadata: Metadata = { title: "Vorher / Nachher" };

interface PageProps {
  params: { id: string; roomId: string };
}

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

export default async function VergleichPage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch room with ownership check via project
  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, room_type, before_image_url, after_image_url, project_id")
    .eq("id", params.roomId)
    .single();

  if (!room) notFound();

  // Verify project belongs to this user
  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", room.project_id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const backHref  = `/dashboard/projekte/${project.id}`;
  const roomLabel = ROOM_LABELS[room.room_type] ?? room.room_type ?? "";
  const hasBefore = !!room.before_image_url;
  const hasAfter  = !!room.after_image_url;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {project.name}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-gray-400 mb-1">
          {room.name} · {roomLabel}
        </p>
        <h1 className="font-headline text-3xl sm:text-4xl text-gray-900 leading-tight">
          Vorher / Nachher
        </h1>
      </div>

      {/* Slider or missing-photos state */}
      {hasBefore && hasAfter ? (
        <>
          <BeforeAfterSlider
            beforeUrl={room.before_image_url!}
            afterUrl={room.after_image_url!}
          />
          <p className="mt-3 text-xs text-gray-400 font-sans text-center">
            Ziehe den Regler oder tippe, um Vorher und Nachher zu vergleichen
          </p>
        </>
      ) : (
        <MissingPhotos hasBefore={hasBefore} hasAfter={hasAfter} backHref={backHref} />
      )}
    </div>
  );
}

// ── Missing photos state ───────────────────────────────────────────────────

function MissingPhotos({
  hasBefore,
  hasAfter,
  backHref,
}: {
  hasBefore: boolean;
  hasAfter: boolean;
  backHref: string;
}) {
  const missing = [
    !hasBefore && "Vorher-Foto",
    !hasAfter && "Nachher-Foto",
  ].filter(Boolean).join(" und ");

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
        <ImageOff className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-sans font-semibold text-gray-700 mb-1">
          Vergleich noch nicht möglich
        </p>
        <p className="text-sm text-gray-500 font-sans leading-relaxed max-w-xs">
          Es fehlt noch {missing}. Lade die Fotos in der Projektübersicht hoch.
        </p>
      </div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-forest text-white text-sm font-sans font-medium hover:bg-forest/90 transition-colors"
      >
        <Camera className="w-4 h-4" strokeWidth={1.5} />
        Zur Projektübersicht
      </Link>
    </div>
  );
}
