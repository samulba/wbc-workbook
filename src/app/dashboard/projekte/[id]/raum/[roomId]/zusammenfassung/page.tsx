import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Download,
  Lightbulb, Palette, Heart, Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Zusammenfassung – Wellbeing Workbook" };

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

type M1 = {
  status:           string | null;
  wishes:           string[] | null;
  main_effect:      string | null;
  primary_colors:   string[] | null;
  secondary_colors: string[] | null;
  accent_color:     string | null;
  materials:        string[] | null;
  special_tags:     string[] | null;
  moodboard_urls:   string[] | null;
};

type M2 = {
  status:             string | null;
  primary_style:      string | null;
  palette_primary:    string[] | null;
  palette_secondary:  string[] | null;
  palette_accent:     string | null;
  render_urls:        string[] | null;
  furniture_favorites: { id: string; title: string }[] | null;
  zones:              { id: string; label: string; kind: string }[] | null;
};

type M3 = {
  status:             string | null;
  preset:             string | null;
  light_warmth:       number | null;
  light_brightness:   number | null;
  studio_render_urls: string[] | null;
  current_fixtures:   { id: string; name: string; kind: string }[] | null;
};

type M4 = {
  status:             string | null;
  reverb_level:       string | null;
  acoustic_measures:  string[] | null;
  scent_method:       string | null;
  preferred_materials:string[] | null;
  rituals:            { id: string; block: string; title: string }[] | null;
};

type RoomRow = {
  id:                string;
  name:              string;
  room_type:         string;
  before_image_url:  string | null;
  rendered_images:   string[] | null;
  module1_analysis:  M1[] | M1 | null;
  module2_analysis:  M2[] | M2 | null;
  module3_analysis:  M3[] | M3 | null;
  module4_analysis:  M4[] | M4 | null;
};

function first<T>(v: T[] | T | null): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

export default async function CapstonePage({
  params,
}: {
  params: { id: string; roomId: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, name,
      rooms (
        id, name, room_type, before_image_url, rendered_images,
        module1_analysis ( status, wishes, main_effect, primary_colors, secondary_colors, accent_color, materials, special_tags, moodboard_urls ),
        module2_analysis ( status, primary_style, palette_primary, palette_secondary, palette_accent, render_urls, furniture_favorites, zones ),
        module3_analysis ( status, preset, light_warmth, light_brightness, studio_render_urls, current_fixtures ),
        module4_analysis ( status, reverb_level, acoustic_measures, scent_method, preferred_materials, rituals )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const allRooms = ((project.rooms as RoomRow[]) ?? []);
  const room     = allRooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const m1 = first(room.module1_analysis);
  const m2 = first(room.module2_analysis);
  const m3 = first(room.module3_analysis);
  const m4 = first(room.module4_analysis);

  const modulesStatus = [
    { num: "01", label: "Analyse",        completed: m1?.status === "completed" },
    { num: "02", label: "Interior-Guide", completed: m2?.status === "completed" },
    { num: "03", label: "Licht-Guide",    completed: m3?.status === "completed" },
    { num: "04", label: "Sinnes-Guide",   completed: m4?.status === "completed" },
  ];
  const completedCount = modulesStatus.filter((m) => m.completed).length;

  // Moodboard: combine AI renders + any stored moodboard URLs
  const moodboardImages: string[] = [
    ...(room.rendered_images ?? []),
    ...(m1?.moodboard_urls ?? []),
    ...(m2?.render_urls ?? []),
    ...(m3?.studio_render_urls ?? []),
  ].filter(Boolean).slice(0, 9);

  const roomLabel = ROOM_LABELS[room.room_type] ?? room.room_type;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back */}
      <Link
        href={`/dashboard/projekte/${project.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray/60 hover:text-forest transition-colors font-sans mb-6 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        {project.name}
      </Link>

      {/* Hero */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">Zusammenfassung</span>
      </div>
      <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-forest leading-tight mb-1">
        {room.name}
      </h1>
      <p className="text-sm text-gray/60 font-sans mb-8">
        {roomLabel} · {completedCount} / 4 Modulen abgeschlossen
      </p>

      {/* Module status strip */}
      <div className="grid grid-cols-4 gap-2 mb-10">
        {modulesStatus.map((m) => (
          <div
            key={m.num}
            className={cn(
              "rounded-xl border p-3 flex flex-col items-center gap-1.5",
              m.completed ? "border-forest/25 bg-forest/5" : "border-sand/30 bg-white",
            )}
          >
            {m.completed
              ? <CheckCircle2 className="w-5 h-5 text-forest" strokeWidth={1.75} />
              : <Circle       className="w-5 h-5 text-gray-300" strokeWidth={1.5} />}
            <p className={cn("text-[11px] font-sans font-medium uppercase tracking-wider", m.completed ? "text-forest" : "text-gray-400")}>
              {m.num} · {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Moodboard */}
      {moodboardImages.length > 0 && (
        <section className="mb-10">
          <h2 className="font-headline text-xl text-forest mb-3">Dein Moodboard</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {moodboardImages.map((url, i) => (
              <div key={url + i} className="relative rounded-xl overflow-hidden border border-sand/30 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Moodboard ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary grid */}
      <section className="grid gap-4 mb-10">
        {/* M1: Analyse */}
        <SummaryCard
          num="01" title="Analyse & Vorbereitung" Icon={Heart}
          ready={!!m1} done={m1?.status === "completed"}
          editHref={`/dashboard/projekte/${project.id}/raum/${room.id}/modul-1?edit=true`}
        >
          {m1?.wishes && m1.wishes.filter(Boolean).length > 0 && (
            <FactList label="Wünsche">{m1.wishes.filter(Boolean)}</FactList>
          )}
          {m1?.main_effect && <FactSingle label="Hauptwirkung" value={m1.main_effect.replaceAll("_", " ")} />}
          {m1?.materials && m1.materials.length > 0 && (
            <FactList label="Materialien">{m1.materials}</FactList>
          )}
        </SummaryCard>

        {/* M2: Interior */}
        <SummaryCard
          num="02" title="Interior-Guide" Icon={Palette}
          ready={!!m2} done={m2?.status === "completed"}
          editHref={`/dashboard/projekte/${project.id}/raum/${room.id}/modul-2?edit=true`}
        >
          {m2?.primary_style && <FactSingle label="Leit-Stil" value={m2.primary_style} />}
          {m2 && (m2.palette_primary?.length || m2.palette_secondary?.length || m2.palette_accent) && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-sand font-sans">Palette</span>
              <div className="flex h-5 rounded overflow-hidden border border-sand/30">
                {[...(m2.palette_primary ?? []), ...(m2.palette_secondary ?? []), m2.palette_accent]
                  .filter(Boolean)
                  .map((c, i) => <div key={i} className="flex-1" style={{ background: c ?? "#ddd" }} />)}
              </div>
            </div>
          )}
          {m2?.zones && m2.zones.length > 0 && (
            <FactList label="Zonen">{m2.zones.map((z) => z.label || z.kind)}</FactList>
          )}
          {m2?.furniture_favorites && m2.furniture_favorites.length > 0 && (
            <FactSingle label="Wunsch-Möbel" value={`${m2.furniture_favorites.length} Einträge`} />
          )}
        </SummaryCard>

        {/* M3: Licht */}
        <SummaryCard
          num="03" title="Licht-Guide" Icon={Lightbulb}
          ready={!!m3} done={m3?.status === "completed"}
          editHref={`/dashboard/projekte/${project.id}/raum/${room.id}/modul-3?edit=true`}
        >
          {m3?.preset && <FactSingle label="Preset" value={m3.preset} />}
          {(m3?.light_warmth !== null && m3?.light_warmth !== undefined) && (
            <FactSingle label="Wärme / Helligkeit" value={`${m3.light_warmth} / ${m3.light_brightness ?? "–"}`} />
          )}
          {m3?.current_fixtures && m3.current_fixtures.length > 0 && (
            <FactList label="Lichtquellen">{m3.current_fixtures.map((f) => f.name || f.kind)}</FactList>
          )}
        </SummaryCard>

        {/* M4: Sinne */}
        <SummaryCard
          num="04" title="Sinnes-Guide" Icon={Wind}
          ready={!!m4} done={m4?.status === "completed"}
          editHref={`/dashboard/projekte/${project.id}/raum/${room.id}/modul-4?edit=true`}
        >
          {m4?.reverb_level && <FactSingle label="Akustik" value={m4.reverb_level} />}
          {m4?.acoustic_measures && m4.acoustic_measures.length > 0 && (
            <FactList label="Akustik-Maßnahmen">{m4.acoustic_measures}</FactList>
          )}
          {m4?.scent_method && <FactSingle label="Duft-Träger" value={m4.scent_method} />}
          {m4?.preferred_materials && m4.preferred_materials.length > 0 && (
            <FactList label="Haptik (bevorzugt)">{m4.preferred_materials}</FactList>
          )}
          {m4?.rituals && m4.rituals.length > 0 && (
            <FactSingle label="Rituale" value={`${m4.rituals.length} geplant`} />
          )}
        </SummaryCard>
      </section>

      {/* PDF export */}
      <a
        href={`/api/export/raumidee/${project.id}/${room.id}`}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-forest text-cream text-sm font-sans font-medium hover:bg-forest/90 transition-colors"
      >
        <Download className="w-4 h-4" strokeWidth={1.75} />
        PDF-Export herunterladen
      </a>

      <div className="h-12" />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  num, title, Icon, ready, done, editHref, children,
}: {
  num:      string;
  title:    string;
  Icon:     React.ElementType;
  ready:    boolean;
  done:     boolean;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-2xl border bg-white overflow-hidden",
      done ? "border-forest/20" : "border-sand/30",
    )}>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
            done ? "bg-forest/8 border-forest/20 text-forest" : "bg-gray-100 border-gray-200 text-gray-400",
          )}>
            <Icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Modul {num}</p>
            <h3 className={cn("font-headline text-base leading-tight", done ? "text-forest" : "text-gray-500")}>
              {title}
            </h3>
          </div>
        </div>
        <Link
          href={editHref}
          className="inline-flex items-center gap-1 text-xs font-sans text-forest/70 hover:text-forest transition-colors shrink-0"
        >
          Bearbeiten
          <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="p-5 flex flex-col gap-3">
        {ready ? children : (
          <p className="text-sm text-gray/45 font-sans italic">Noch nicht ausgefüllt.</p>
        )}
      </div>
    </div>
  );
}

function FactSingle({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-sand font-sans">{label}</span>
      <span className="text-sm font-sans text-forest capitalize">{value}</span>
    </div>
  );
}

function FactList({ label, children }: { label: string; children: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-sand font-sans">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {children.map((item) => (
          <span key={item} className="text-[11px] font-sans text-forest/70 bg-cream border border-sand/30 px-2.5 py-0.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
