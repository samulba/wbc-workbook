import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  CalendarDays, Euro, Clock, Plus, PhoneCall,
  Home, Sofa, Moon, Monitor, Star, Droplets,
  ChefHat, UtensilsCrossed, DoorOpen, Package,
  Briefcase, Leaf, Sparkles, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { RoomCard } from "./_components/RoomCard";
import type { RoomCardData } from "./_components/RoomCard";
import { CircleProgress } from "@/components/CircleProgress";

type ProjectStatus = "entwurf" | "aktiv" | "abgeschlossen" | "archiviert";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("projects").select("name").eq("id", params.id).single();
  return { title: data?.name ?? "Projekt" };
}

// ── Config ────────────────────────────────────────────────────���───────────────

const STATUS_CONFIG: Record<ProjectStatus, { label: string; dot: string; badge: string }> = {
  entwurf:       { label: "Entwurf",       dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200"  },
  aktiv:         { label: "Aktiv",         dot: "bg-forest",     badge: "bg-forest/8 text-forest border-forest/20"     },
  abgeschlossen: { label: "Abgeschlossen", dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200"    },
  archiviert:    { label: "Archiviert",    dot: "bg-gray-300",   badge: "bg-gray-50 text-gray-400 border-gray-200"     },
};

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const ROOM_ICONS: Record<string, LucideIcon> = {
  wohnzimmer: Sofa, schlafzimmer: Moon,
  arbeitszimmer: Monitor, kinderzimmer: Star,
  badezimmer: Droplets, kueche: ChefHat,
  esszimmer: UtensilsCrossed, flur: DoorOpen,
  keller: Package, buero: Briefcase,
  yogaraum: Leaf, wellness: Sparkles,
  studio: Camera, sonstiges: Home,
};

const MODULES = [
  {
    number: "01", subtitle: "Modul 1", title: "Analyse & Vorbereitung",
    description: "Erkunde die gewünschte Raumwirkung, deine Farbwelt, Materialvorlieben und erste Inspirationen für dein Moodboard.",
    topics: ["Raumwirkung", "Farbwelt", "Materialien", "Moodboard"],
    available: true,
  },
  {
    number: "02", subtitle: "Modul 2", title: "Interior-Guide",
    description: "Entwickle dein persönliches Einrichtungskonzept – von der Möbelauswahl bis zur stimmigen Gesamtkomposition.",
    topics: ["Möbelauswahl", "Stilfindung", "Raumplanung", "Komposition"],
    available: false,
  },
  {
    number: "03", subtitle: "Modul 3", title: "Licht-Guide",
    description: "Gestalte ein durchdachtes Lichtkonzept, das Atmosphäre schafft und die Raumwirkung gezielt unterstützt.",
    topics: ["Grundbeleuchtung", "Akzentlicht", "Stimmungslicht", "Lichtplanung"],
    available: false,
  },
  {
    number: "04", subtitle: "Modul 4", title: "Sinnes-Guide",
    description: "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und das ganzheitliche Raumgefühl.",
    topics: ["Akustik", "Duft", "Haptik", "Raumgefühl"],
    available: false,
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────���────────────

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, name, description, status, budget, deadline, created_at,
      rooms (
        id, name, room_type, before_image_url, after_image_url,
        share_token, is_shared, ai_analysis, rendered_images,
        module1_analysis ( status, current_step ),
        module2_analysis ( status, current_step ),
        module3_analysis ( status, current_step ),
        module4_analysis ( status, current_step )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  type ModuleStatus = { status: string | null; current_step: number | null };
  type RoomRow = {
    id: string; name: string; room_type: string;
    before_image_url: string | null; after_image_url: string | null;
    share_token: string | null; is_shared: boolean;
    ai_analysis: string | null;
    rendered_images: string[] | null;
    module1_analysis: ModuleStatus[] | null;
    module2_analysis: ModuleStatus[] | null;
    module3_analysis: ModuleStatus[] | null;
    module4_analysis: ModuleStatus[] | null;
  };

  const rooms     = (project.rooms as RoomRow[]) ?? [];
  const firstRoom = rooms[0];
  const m1        = firstRoom?.module1_analysis?.[0];
  const m2        = firstRoom?.module2_analysis?.[0];
  const m3        = firstRoom?.module3_analysis?.[0];

  const m1Completed = m1?.status === "completed";
  const m1Step      = m1Completed ? 6 : (m1?.current_step ?? 0);
  const m1Pct       = Math.min(100, Math.round((m1Step / 6) * 100));
  const m1Started   = m1Step > 0;

  const m2Completed = m2?.status === "completed";
  const m2Step      = m2Completed ? 8 : (m2?.current_step ?? 0);
  const m2Pct       = Math.min(100, Math.round((m2Step / 8) * 100));
  const m2Started   = m2Step > 0;

  const m3Completed = m3?.status === "completed";
  const m3Step      = m3Completed ? 7 : (m3?.current_step ?? 0);
  const m3Pct       = Math.min(100, Math.round((m3Step / 7) * 100));
  const m3Started   = m3Step > 0;

  const m4          = firstRoom?.module4_analysis?.[0];
  const m4Completed = m4?.status === "completed";
  const m4Step      = m4Completed ? 6 : (m4?.current_step ?? 0);
  const m4Pct       = Math.min(100, Math.round((m4Step / 6) * 100));
  const m4Started   = m4Step > 0;

  const allModulesComplete = m1Completed && m2Completed && m3Completed && m4Completed;

  // Average m1 progress across ALL rooms
  const avgM1Pct = rooms.length === 0 ? 0 : Math.round(
    rooms.reduce((sum, r) => {
      const ra = r.module1_analysis?.[0];
      const completed = ra?.status === "completed";
      const step = completed ? 6 : (ra?.current_step ?? 0);
      return sum + Math.min(100, Math.round((step / 6) * 100));
    }, 0) / rooms.length
  );

  const primaryRoom = firstRoom;
  const RoomIcon    = ROOM_ICONS[primaryRoom?.room_type ?? ""] ?? Home;
  const roomLabel   = ROOM_LABELS[primaryRoom?.room_type ?? ""] ?? primaryRoom?.room_type ?? "–";
  const statusCfg   = STATUS_CONFIG[project.status as ProjectStatus] ?? STATUS_CONFIG.entwurf;

  const createdAt = new Date(project.created_at).toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const m1Href = firstRoom
    ? `${m1Completed ? "?edit=true" : ""}`
      ? `/dashboard/projekte/${project.id}/raum/${firstRoom.id}/modul-1${m1Completed ? "?edit=true" : ""}`
      : `/dashboard/projekte/${project.id}/raum/${firstRoom.id}/modul-1`
    : "#";

  const m2Href = firstRoom
    ? `/dashboard/projekte/${project.id}/raum/${firstRoom.id}/modul-2${m2Completed ? "?edit=true" : ""}`
    : "#";

  const m3Href = firstRoom
    ? `/dashboard/projekte/${project.id}/raum/${firstRoom.id}/modul-3${m3Completed ? "?edit=true" : ""}`
    : "#";

  const m4Href = firstRoom
    ? `/dashboard/projekte/${project.id}/raum/${firstRoom.id}/modul-4${m4Completed ? "?edit=true" : ""}`
    : "#";

  const capstoneHref = firstRoom
    ? `/dashboard/projekte/${project.id}/raum/${firstRoom.id}/zusammenfassung`
    : "#";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <span className={cn(
            "self-start inline-flex items-center gap-1.5 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full border",
            statusCfg.badge
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
            {statusCfg.label}
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-gray-500 font-sans max-w-lg">{project.description}</p>
          )}
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
          <RoomIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
          <span className="text-xs font-sans text-gray-700">
            {rooms.length === 1 ? (primaryRoom?.name ?? roomLabel) : `${rooms.length} Räume`}
          </span>
          {rooms.length === 1 && primaryRoom?.name && primaryRoom.name !== roomLabel && (
            <span className="text-xs text-gray-400 font-sans">· {roomLabel}</span>
          )}
        </div>

        {project.budget != null && (
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
            <Euro className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-sans text-gray-700">
              {project.budget.toLocaleString("de-DE")} € Budget
            </span>
          </div>
        )}

        {deadline && (
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-sans text-gray-700">Deadline: {deadline}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
          <span className="text-xs font-sans text-gray-500">Erstellt {createdAt}</span>
        </div>
      </div>

      {/* ── Rooms ─────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-sans font-semibold text-gray-700 uppercase tracking-wider">
          Räume in diesem Projekt
        </h2>
        <span className="text-xs text-gray-400 font-sans">
          {rooms.length} {rooms.length === 1 ? "Raum" : "Räume"}
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        {(rooms as RoomCardData[]).map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            projectId={project.id}
            canDelete={rooms.length > 1}
          />
        ))}
      </div>

      <Link
        href={`/dashboard/projekte/${project.id}/raum/neu`}
        className="inline-flex items-center gap-2 h-9 px-3.5 mb-10 rounded-lg border border-dashed border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 text-sm font-sans font-medium text-gray-500 hover:text-gray-700 transition-all"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
        Weiteren Raum hinzufügen
      </Link>

      {/* ── Module grid ────────────────��──────────────────────── */}
      <div className="mb-4">
        <h2 className="text-sm font-sans font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Module
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">

          {/* Modul 1 – active */}
          <Link
            href={m1Href}
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-forest/30 transition-colors duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest" />
                <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-gray-400">
                  {MODULES[0].subtitle}
                </span>
              </div>
              {m1Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest bg-forest/8 border border-forest/15 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  Abgeschlossen
                </span>
              ) : m1Started ? (
                <span className="text-[11px] font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  In Bearbeitung
                </span>
              ) : (
                <span className="text-[11px] font-sans text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                  Nicht gestartet
                </span>
              )}
            </div>

            <h3 className="font-headline text-lg text-gray-900 mb-1.5 leading-snug">
              {MODULES[0].title}
            </h3>
            <p className="text-sm text-gray-500 font-sans leading-relaxed mb-4 line-clamp-2">
              {MODULES[0].description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              {/* Ring for average across all rooms */}
              <CircleProgress
                pct={rooms.length > 1 ? avgM1Pct : m1Pct}
                size={52}
                stroke={4}
                labelSize="text-[11px]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans text-gray-400 mb-1">
                  {rooms.length > 1 ? `Durchschnitt · ${rooms.length} Räume` : "Fortschritt Modul 1"}
                </p>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      (rooms.length > 1 ? avgM1Pct : m1Pct) >= 100 ? "bg-forest"
                      : (rooms.length > 1 ? avgM1Pct : m1Pct) >= 50   ? "bg-forest/70"
                      : "bg-mint"
                    )}
                    style={{ width: `${rooms.length > 1 ? avgM1Pct : m1Pct}%` }}
                  />
                </div>
                {rooms.length > 1 && (
                  <p className="text-[11px] font-sans text-gray-400 mt-1">
                    {rooms.filter(r => r.module1_analysis?.[0]?.status === "completed").length}/{rooms.length} Räume abgeschlossen
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {MODULES[0].topics.map((t) => (
                  <span key={t} className="text-[11px] font-sans text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs font-sans font-medium text-gray-400 group-hover:text-forest transition-colors shrink-0 ml-3">
                {m1Completed ? "Bearbeiten" : m1Started ? "Fortsetzen" : "Starten"}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </span>
            </div>
          </Link>

          {/* Modul 2 – active (soft-gated: recommended after M1) */}
          <Link
            href={m2Href}
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-forest/30 transition-colors duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest" />
                <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-gray-400">
                  {MODULES[1].subtitle}
                </span>
              </div>
              {m2Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest bg-forest/8 border border-forest/15 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  Abgeschlossen
                </span>
              ) : m2Started ? (
                <span className="text-[11px] font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  In Bearbeitung
                </span>
              ) : !m1Completed ? (
                <span className="text-[11px] font-sans font-medium text-sand bg-sand/15 border border-sand/30 px-2 py-0.5 rounded-full">
                  Empfohlen nach M1
                </span>
              ) : (
                <span className="text-[11px] font-sans text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                  Bereit zum Start
                </span>
              )}
            </div>

            <h3 className="font-headline text-lg text-gray-900 mb-1.5 leading-snug">
              {MODULES[1].title}
            </h3>
            <p className="text-sm text-gray-500 font-sans leading-relaxed mb-4 line-clamp-2">
              {MODULES[1].description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <CircleProgress pct={m2Pct} size={52} stroke={4} labelSize="text-[11px]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans text-gray-400 mb-1">Fortschritt Modul 2</p>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      m2Pct >= 100 ? "bg-forest" : m2Pct >= 50 ? "bg-forest/70" : "bg-mint",
                    )}
                    style={{ width: `${m2Pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {MODULES[1].topics.map((t) => (
                  <span key={t} className="text-[11px] font-sans text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs font-sans font-medium text-gray-400 group-hover:text-forest transition-colors shrink-0 ml-3">
                {m2Completed ? "Bearbeiten" : m2Started ? "Fortsetzen" : "Starten"}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </span>
            </div>
          </Link>

          {/* Modul 3 – active (soft-gated: recommended after M1) */}
          <Link
            href={m3Href}
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-forest/30 transition-colors duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest" />
                <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-gray-400">
                  {MODULES[2].subtitle}
                </span>
              </div>
              {m3Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest bg-forest/8 border border-forest/15 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  Abgeschlossen
                </span>
              ) : m3Started ? (
                <span className="text-[11px] font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  In Bearbeitung
                </span>
              ) : !m1Completed ? (
                <span className="text-[11px] font-sans font-medium text-sand bg-sand/15 border border-sand/30 px-2 py-0.5 rounded-full">
                  Empfohlen nach M1
                </span>
              ) : (
                <span className="text-[11px] font-sans text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                  Bereit zum Start
                </span>
              )}
            </div>

            <h3 className="font-headline text-lg text-gray-900 mb-1.5 leading-snug">
              {MODULES[2].title}
            </h3>
            <p className="text-sm text-gray-500 font-sans leading-relaxed mb-4 line-clamp-2">
              {MODULES[2].description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <CircleProgress pct={m3Pct} size={52} stroke={4} labelSize="text-[11px]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans text-gray-400 mb-1">Fortschritt Modul 3</p>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      m3Pct >= 100 ? "bg-forest" : m3Pct >= 50 ? "bg-forest/70" : "bg-mint",
                    )}
                    style={{ width: `${m3Pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {MODULES[2].topics.map((t) => (
                  <span key={t} className="text-[11px] font-sans text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs font-sans font-medium text-gray-400 group-hover:text-forest transition-colors shrink-0 ml-3">
                {m3Completed ? "Bearbeiten" : m3Started ? "Fortsetzen" : "Starten"}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </span>
            </div>
          </Link>

          {/* Modul 4 – active (soft-gated: recommended after M1) */}
          <Link
            href={m4Href}
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-forest/30 transition-colors duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest" />
                <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-gray-400">
                  {MODULES[3].subtitle}
                </span>
              </div>
              {m4Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest bg-forest/8 border border-forest/15 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  Abgeschlossen
                </span>
              ) : m4Started ? (
                <span className="text-[11px] font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  In Bearbeitung
                </span>
              ) : !m1Completed ? (
                <span className="text-[11px] font-sans font-medium text-sand bg-sand/15 border border-sand/30 px-2 py-0.5 rounded-full">
                  Empfohlen nach M1
                </span>
              ) : (
                <span className="text-[11px] font-sans text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                  Bereit zum Start
                </span>
              )}
            </div>

            <h3 className="font-headline text-lg text-gray-900 mb-1.5 leading-snug">
              {MODULES[3].title}
            </h3>
            <p className="text-sm text-gray-500 font-sans leading-relaxed mb-4 line-clamp-2">
              {MODULES[3].description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <CircleProgress pct={m4Pct} size={52} stroke={4} labelSize="text-[11px]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans text-gray-400 mb-1">Fortschritt Modul 4</p>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      m4Pct >= 100 ? "bg-forest" : m4Pct >= 50 ? "bg-forest/70" : "bg-mint",
                    )}
                    style={{ width: `${m4Pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {MODULES[3].topics.map((t) => (
                  <span key={t} className="text-[11px] font-sans text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs font-sans font-medium text-gray-400 group-hover:text-forest transition-colors shrink-0 ml-3">
                {m4Completed ? "Bearbeiten" : m4Started ? "Fortsetzen" : "Starten"}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Capstone CTA (all modules completed) ──────────── */}
      {firstRoom && (
        <div className="mt-6">
          <Link
            href={capstoneHref}
            className={cn(
              "group flex items-start gap-4 rounded-xl border p-5 transition-colors",
              allModulesComplete
                ? "border-forest/30 bg-gradient-to-br from-forest/5 to-mint/10 hover:border-forest/50 hover:shadow-warm-sm"
                : "border-gray-200 bg-white hover:border-forest/30"
            )}
          >
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform",
              allModulesComplete ? "bg-forest text-cream group-hover:scale-105" : "bg-gray-100 text-gray-400",
            )}>
              <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-headline text-base leading-snug mb-0.5",
                allModulesComplete ? "text-forest" : "text-gray-700",
              )}>
                {allModulesComplete ? "Dein Raumkonzept ist fertig!" : "Abschluss-Zusammenfassung"}
              </h3>
              <p className="text-xs text-gray/60 font-sans leading-relaxed">
                {allModulesComplete
                  ? "Moodboard, Zusammenfassung aller vier Module und PDF-Export für deinen Raum."
                  : "Wird freigeschaltet, sobald alle vier Module abgeschlossen sind."}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-sans font-medium text-forest">
              {allModulesComplete ? "Öffnen" : "Vorschau"}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
            </span>
          </Link>
        </div>
      )}

      {/* ── Coaching CTA ──────────────────────────────────── */}
      <div className="rounded-xl border border-sand/30 bg-white overflow-hidden">
        <div className="flex items-start gap-4 px-5 py-5">
          <div className="w-10 h-10 rounded-xl bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-forest/60" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline text-base text-gray-900 mb-0.5">
              Experten-Beratung buchen
            </h3>
            <p className="text-xs font-sans text-gray-500 leading-relaxed">
              Besprich dein Raumkonzept persönlich mit Interior-Expertin Lisa – 30 Minuten, ganz individuell.
            </p>
          </div>
          <Link
            href={firstRoom
              ? `/coaching/buchen?room=${firstRoom.id}`
              : "/coaching/buchen"
            }
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-forest text-white text-xs font-sans font-medium px-3 py-2 hover:bg-forest/90 transition-colors"
          >
            Termin buchen
            <ArrowRight className="w-3 h-3" strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
}

