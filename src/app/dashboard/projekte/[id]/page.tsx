import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Lock,
  CalendarDays, Euro, Clock,
  Home, Sofa, Moon, Monitor, Star, Droplets,
  ChefHat, UtensilsCrossed, DoorOpen, Package,
  Briefcase, Leaf, Sparkles, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type ProjectStatus = "entwurf" | "aktiv" | "abgeschlossen" | "archiviert";

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("name")
    .eq("id", params.id)
    .single();
  return { title: data?.name ?? "Projekt" };
}

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dot: string; badge: string }
> = {
  entwurf:       { label: "Entwurf",       dot: "bg-sand",      badge: "bg-sand/25 text-[#7a5520] border-sand/40" },
  aktiv:         { label: "Aktiv",         dot: "bg-mint",      badge: "bg-mint/20 text-forest border-mint/30" },
  abgeschlossen: { label: "Abgeschlossen", dot: "bg-forest/50", badge: "bg-forest/8 text-forest/60 border-forest/15" },
  archiviert:    { label: "Archiviert",    dot: "bg-gray/30",   badge: "bg-gray/10 text-gray/50 border-gray/20" },
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
    number: "01",
    subtitle: "Modul 1",
    title: "Analyse & Vorbereitung",
    description:
      "Erkunde die gewünschte Raumwirkung, deine Farbwelt, Materialvorlieben und sammle erste Inspirationen für dein Moodboard.",
    topics: ["Raumwirkung", "Farbwelt", "Materialien", "Moodboard"],
    available: true,
    totalSteps: 11,
    accent: "border-mint/40 hover:border-mint/70",
    numberColor: "text-mint/70",
    badgeAvailable: "bg-mint/15 text-forest border-mint/25",
  },
  {
    number: "02",
    subtitle: "Modul 2",
    title: "Interior-Guide",
    description:
      "Entwickle dein persönliches Einrichtungskonzept – von der Möbelauswahl bis zur stimmigen Gesamtkomposition.",
    topics: ["Möbelauswahl", "Stilfindung", "Raumplanung", "Komposition"],
    available: false,
    accent: "border-sand/25",
    numberColor: "text-sand/50",
    badgeAvailable: "",
  },
  {
    number: "03",
    subtitle: "Modul 3",
    title: "Licht-Guide",
    description:
      "Gestalte ein durchdachtes Lichtkonzept, das Atmosphäre schafft und die Raumwirkung gezielt unterstützt.",
    topics: ["Grundbeleuchtung", "Akzentlicht", "Stimmungslicht", "Lichtplanung"],
    available: false,
    accent: "border-sand/25",
    numberColor: "text-terracotta/30",
    badgeAvailable: "",
  },
  {
    number: "04",
    subtitle: "Modul 4",
    title: "Sinnes-Guide",
    description:
      "Vervollständige dein Raumkonzept durch alle Sinne – Akustik, Duft, Haptik und das ganzheitliche Raumgefühl.",
    topics: ["Akustik", "Duft", "Haptik", "Raumgefühl"],
    available: false,
    accent: "border-sand/25",
    numberColor: "text-forest/25",
    badgeAvailable: "",
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProjectPage({
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
    .select(`
      id, name, description, status, budget, deadline, created_at,
      rooms (
        id, name, room_type,
        module1_analysis ( status, current_step )
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
    module1_analysis: { status: string | null; current_step: number | null }[] | null;
  };

  const room = (project.rooms as RoomRow[])?.[0];
  const m1   = room?.module1_analysis?.[0];

  const statusCfg   = STATUS_CONFIG[project.status as ProjectStatus] ?? STATUS_CONFIG.entwurf;
  const RoomIcon    = ROOM_ICONS[room?.room_type ?? ""] ?? Home;
  const roomLabel   = ROOM_LABELS[room?.room_type ?? ""] ?? room?.room_type ?? "–";

  const createdAt = new Date(project.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  // Module 1 progress
  const m1Completed = m1?.status === "completed";
  const m1Step      = m1Completed ? 11 : (m1?.current_step ?? 0);
  const m1Pct       = Math.min(100, Math.round((m1Step / 11) * 100));
  const m1Started   = m1Step > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10">

      {/* ── Back ──────────────────────────────────────────────── */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray/55 hover:text-forest transition-colors font-sans mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          {/* Status badge */}
          <span
            className={cn(
              "self-start inline-flex items-center gap-1.5 text-xs font-sans font-medium",
              "px-2.5 py-1 rounded-full border",
              statusCfg.badge
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
            {statusCfg.label}
          </span>
          {/* Project name */}
          <h1 className="font-headline text-4xl md:text-5xl text-forest leading-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-gray/60 font-sans max-w-lg mt-0.5">
              {project.description}
            </p>
          )}
        </div>

        {/* Bearbeiten – placeholder */}
        <button
          type="button"
          disabled
          title="Bearbeitung wird in einer zukünftigen Version verfügbar sein"
          className={cn(
            "self-start shrink-0 inline-flex items-center gap-2",
            "h-9 px-4 rounded-lg border border-sand/40 bg-white/50",
            "text-sm font-sans font-medium text-gray/35 cursor-not-allowed"
          )}
        >
          Bearbeiten
          <span className="text-[10px] text-sand/70 font-normal">Demnächst</span>
        </button>
      </div>

      {/* ── Info chips ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {/* Room type */}
        <div className="flex items-center gap-2 rounded-xl border border-sand/30 bg-white/60 px-3.5 py-2">
          <RoomIcon className="w-3.5 h-3.5 text-forest/50 shrink-0" strokeWidth={1.5} />
          <span className="text-xs font-sans font-medium text-forest/70">
            {room?.name ?? roomLabel}
          </span>
          {room?.name && room.name !== roomLabel && (
            <span className="text-xs text-gray/35 font-sans">· {roomLabel}</span>
          )}
        </div>

        {/* Budget */}
        {project.budget != null && (
          <div className="flex items-center gap-2 rounded-xl border border-sand/30 bg-white/60 px-3.5 py-2">
            <Euro className="w-3.5 h-3.5 text-forest/50 shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-sans font-medium text-forest/70">
              {project.budget.toLocaleString("de-DE")} € Budget
            </span>
          </div>
        )}

        {/* Deadline */}
        {deadline && (
          <div className="flex items-center gap-2 rounded-xl border border-sand/30 bg-white/60 px-3.5 py-2">
            <CalendarDays className="w-3.5 h-3.5 text-forest/50 shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-sans font-medium text-forest/70">
              Deadline: {deadline}
            </span>
          </div>
        )}

        {/* Created at */}
        <div className="flex items-center gap-2 rounded-xl border border-sand/30 bg-white/60 px-3.5 py-2">
          <Clock className="w-3.5 h-3.5 text-gray/35 shrink-0" strokeWidth={1.5} />
          <span className="text-xs font-sans text-gray/45">
            Erstellt {createdAt}
          </span>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">
          Deine Module
        </span>
        <div className="flex-1 h-px bg-sand/25" />
      </div>

      {/* ── Module grid ───────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* ── Modul 1 – active ──────────────────────────────── */}
        <Link
          href={
            m1Completed
              ? `/dashboard/projekte/${project.id}/modul-1?edit=true`
              : `/dashboard/projekte/${project.id}/modul-1`
          }
          className={cn(
            "group relative rounded-2xl border bg-white/60 p-6 transition-all",
            "hover:shadow-md hover:bg-white/80",
            MODULES[0].accent
          )}
        >
          {/* Number + status */}
          <div className="flex items-start justify-between mb-4">
            <span className={cn("font-headline text-5xl leading-none", MODULES[0].numberColor)}>
              {MODULES[0].number}
            </span>
            {m1Completed ? (
              <span className="flex items-center gap-1.5 text-xs font-sans font-semibold text-forest bg-forest/8 border border-forest/15 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                Abgeschlossen
              </span>
            ) : m1Started ? (
              <span className="text-xs font-sans font-medium text-sand bg-sand/15 border border-sand/35 px-2.5 py-1 rounded-full">
                In Bearbeitung
              </span>
            ) : (
              <span className="text-xs font-sans text-gray/40 bg-gray/8 border border-gray/15 px-2.5 py-1 rounded-full">
                Nicht gestartet
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-xs text-gray/45 font-sans uppercase tracking-wider mb-1">
            {MODULES[0].subtitle}
          </p>
          <h3 className="font-headline text-xl text-forest mb-2 leading-snug group-hover:text-forest/80 transition-colors">
            {MODULES[0].title}
          </h3>
          <p className="text-sm text-gray/60 font-sans leading-relaxed mb-5">
            {MODULES[0].description}
          </p>

          {/* Progress */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-gray/45">Fortschritt</span>
              <span className={cn(
                "text-xs font-sans font-medium",
                m1Completed ? "text-forest" : "text-gray/50"
              )}>
                {m1Completed
                  ? "11 / 11 ✓"
                  : m1Started
                  ? `Schritt ${m1Step} / 11`
                  : "Noch nicht gestartet"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-sand/30 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  m1Completed ? "bg-forest" : "bg-mint"
                )}
                style={{ width: `${m1Pct}%` }}
              />
            </div>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {MODULES[0].topics.map((t) => (
              <span
                key={t}
                className="text-[11px] font-sans text-gray/50 bg-sand/10 border border-sand/20 px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-end gap-1 text-sm font-sans font-medium text-forest/50 group-hover:text-forest transition-colors">
            {m1Completed ? "Bearbeiten" : m1Started ? "Fortsetzen" : "Starten"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
          </div>
        </Link>

        {/* ── Modul 2, 3, 4 – locked ────────────────────────── */}
        {MODULES.slice(1).map((mod) => (
          <div
            key={mod.number}
            className={cn(
              "relative rounded-2xl border bg-white/30 p-6",
              mod.accent
            )}
          >
            {/* Number + coming soon badge */}
            <div className="flex items-start justify-between mb-4">
              <span className={cn("font-headline text-5xl leading-none", mod.numberColor)}>
                {mod.number}
              </span>
              <span className="text-xs font-sans text-gray/40 bg-gray/8 border border-gray/15 px-2.5 py-1 rounded-full">
                Demnächst
              </span>
            </div>

            {/* Title */}
            <p className="text-xs text-gray/35 font-sans uppercase tracking-wider mb-1">
              {mod.subtitle}
            </p>
            <h3 className="font-headline text-xl text-forest/40 mb-2 leading-snug">
              {mod.title}
            </h3>
            <p className="text-sm text-gray/40 font-sans leading-relaxed mb-5">
              {mod.description}
            </p>

            {/* Lock state */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gray/8 border border-gray/15 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-gray/35" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-sans text-gray/40">
                Demnächst verfügbar
              </span>
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-1.5">
              {mod.topics.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-sans text-gray/30 bg-gray/5 border border-gray/10 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Overlay to prevent interaction feel */}
            <div className="absolute inset-0 rounded-2xl cursor-default" />
          </div>
        ))}
      </div>

      {/* ── Bottom spacer ─────────────────────────────────────── */}
      <div className="h-16" />
    </div>
  );
}
