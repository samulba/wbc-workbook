import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Waves, Target, Zap, Sparkles, Users,
  Lightbulb, ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SharedExportButton } from "./_components/SharedExportButton";

export const metadata: Metadata = { title: "Raumkonzept – Wellbeing Workbook" };

// ── Effect config (inline, no internal import) ────────────────────────────────

const EFFECTS: {
  value: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    value: "ruhe_erholung",
    label: "Ruhe & Erholung",
    description: "Ein Raum, der dir Erholung schenkt – er lädt ein, loszulassen, durchzuatmen und neue Kraft zu schöpfen.",
    Icon: Waves,
    bg: "bg-mint/10", border: "border-mint/30", iconBg: "bg-mint/20", iconColor: "text-forest",
  },
  {
    value: "fokus_konzentration",
    label: "Fokus & Konzentration",
    description: "Ein Raum, der deinen Geist schärft – klar strukturiert, ohne Ablenkung, perfekt für konzentriertes Arbeiten.",
    Icon: Target,
    bg: "bg-[#e9eff2]/80", border: "border-[#c0d0d8]/50", iconBg: "bg-[#d0e0e8]/60", iconColor: "text-[#3d5a68]",
  },
  {
    value: "energie_aktivitaet",
    label: "Energie & Aktivität",
    description: "Ein Raum, der dich in Schwung bringt – belebend, motivierend und voller Energie für alles, was du anpackst.",
    Icon: Zap,
    bg: "bg-terracotta/8", border: "border-terracotta/25", iconBg: "bg-terracotta/15", iconColor: "text-terracotta",
  },
  {
    value: "kreativitaet_inspiration",
    label: "Kreativität & Inspiration",
    description: "Ein Raum, der deine Kreativität entfacht – voller Impulse, der dein Denken beflügelt und neue Ideen wachsen lässt.",
    Icon: Sparkles,
    bg: "bg-sand/20", border: "border-sand/50", iconBg: "bg-sand/30", iconColor: "text-[#8a6030]",
  },
  {
    value: "begegnung_austausch",
    label: "Begegnung & Austausch",
    description: "Ein Raum, der Menschen zusammenbringt – einladend, warm und offen für echte Begegnungen und Gespräche.",
    Icon: Users,
    bg: "bg-forest/8", border: "border-forest/20", iconBg: "bg-forest/15", iconColor: "text-forest",
  },
];

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const LIGHT_LABELS: Record<string, string> = {
  warm_indirekt: "Warm & indirekt",
  hell_klar: "Hell & klar",
  beides_steuerbar: "Beides – steuerbar",
};

// ── RPC return shape ──────────────────────────────────────────────────────────

type SharedRoom = {
  room_name:         string;
  room_type:         string;
  project_name:      string;
  created_at:        string;
  main_effect:       string | null;
  primary_colors:    string[] | null;
  secondary_colors:  string[] | null;
  accent_color:      string | null;
  materials:         string[] | null;
  light_mood:        string | null;
  special_elements:  string | null;
  moodboard_urls:    string[] | null;
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SharedRoomPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc("get_shared_room", { p_token: params.token })
    .single<SharedRoom>();

  // Not found or not shared → deactivated state
  if (error || !data) {
    return <DeactivatedPage />;
  }

  const room = data;

  const effectMeta  = room.main_effect ? EFFECTS.find((e) => e.value === room.main_effect) : null;
  const primary     = (room.primary_colors   ?? []).filter(Boolean);
  const secondary   = (room.secondary_colors ?? []).filter(Boolean);
  const accent      = room.accent_color?.trim() ?? "";
  const allColors   = [...primary, ...secondary, accent].filter(Boolean);
  const materials   = (room.materials ?? []).filter(Boolean);
  const lightLabel  = LIGHT_LABELS[room.light_mood ?? ""] ?? "";
  const moodboard   = (room.moodboard_urls ?? []).filter((u) => /^https?:\/\//i.test(u));
  const roomLabel   = ROOM_LABELS[room.room_type] ?? room.room_type;
  const createdYear = new Date(room.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="border-b border-sand/30 bg-cream/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center justify-between gap-3">
          <span className="font-headline text-base text-forest tracking-wide">
            Wellbeing Workbook
          </span>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-forest/70 hover:text-forest transition-colors"
          >
            Eigenes Konzept erstellen
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-5 pt-10 pb-8">
        <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-sand mb-2">
          Geteiltes Raumkonzept
        </p>
        <h1 className="font-headline text-3xl sm:text-4xl text-forest leading-tight mb-1.5">
          {room.room_name}
        </h1>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-sans text-gray/50">
            {roomLabel} · {createdYear}
          </p>
          <SharedExportButton
            projectName={room.project_name}
            roomName={room.room_name}
            roomType={room.room_type}
            mainEffect={room.main_effect}
            primaryColors={room.primary_colors}
            secondaryColors={room.secondary_colors}
            accentColor={room.accent_color}
            materials={room.materials}
            lightMood={room.light_mood}
            moodboardUrls={room.moodboard_urls}
          />
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-5 pb-20 flex flex-col gap-8">

        {/* Hauptwirkung */}
        {effectMeta && (
          <div className={`rounded-2xl border px-5 py-5 flex gap-4 ${effectMeta.bg} ${effectMeta.border}`}>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${effectMeta.iconBg} ${effectMeta.border}`}>
              <effectMeta.Icon className={`w-5 h-5 ${effectMeta.iconColor}`} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-1">
                Hauptwirkung
              </p>
              <p className="font-headline text-xl text-forest leading-snug mb-1.5">
                {effectMeta.label}
              </p>
              <p className="text-xs font-sans text-gray/55 leading-relaxed">
                {effectMeta.description}
              </p>
            </div>
          </div>
        )}

        {/* Farbwelt */}
        {allColors.length > 0 && (
          <section>
            <h2 className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-3">
              Farbwelt
            </h2>
            <div className="flex flex-wrap gap-3">
              {allColors.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className="w-10 h-10 rounded-full border border-sand/30 shadow-sm"
                    style={{
                      backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : undefined,
                      background: /^#[0-9a-fA-F]{3,6}$/.test(c) ? undefined : "#cba17840",
                    }}
                    title={c}
                  />
                  <span className="text-[9px] font-mono text-gray/35 max-w-[44px] truncate">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Materialien */}
        {materials.length > 0 && (
          <section>
            <h2 className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-3">
              Materialien
            </h2>
            <div className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <span
                  key={m}
                  className="text-xs font-sans font-medium text-forest/70 bg-forest/5 border border-forest/10 px-3 py-1.5 rounded-full"
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Lichtstimmung */}
        {lightLabel && (
          <section className="flex items-center gap-3 rounded-xl border border-sand/30 bg-white/50 px-4 py-3.5">
            <Lightbulb className="w-4.5 h-4.5 text-sand shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-0.5">
                Lichtstimmung
              </p>
              <p className="text-sm font-sans font-medium text-forest">{lightLabel}</p>
            </div>
          </section>
        )}

        {/* Besondere Elemente */}
        {room.special_elements && (
          <section>
            <h2 className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-2">
              Besondere Elemente
            </h2>
            <p className="text-sm font-sans text-gray/65 leading-relaxed">
              {room.special_elements}
            </p>
          </section>
        )}

        {/* Moodboard */}
        {moodboard.length > 0 && (
          <section>
            <h2 className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-3">
              Moodboard{moodboard.length > 1 ? ` (${moodboard.length} Bilder)` : ""}
            </h2>
            <div
              className={`grid gap-2.5 ${moodboard.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {moodboard.map((url, i) => (
                <div
                  key={url}
                  className="rounded-xl overflow-hidden border border-sand/30 bg-sand/5"
                  style={{ aspectRatio: moodboard.length === 1 ? "16/9" : "4/3" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Moodboard ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── Footer CTA ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-sand/30 bg-white/60">
        <div className="mx-auto max-w-2xl px-5 py-8 text-center">
          <p className="text-xs font-sans text-gray/40 mb-3">
            Erstellt mit Wellbeing Workbook
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-forest text-white text-sm font-sans font-medium px-5 py-2.5 hover:bg-forest/90 transition-colors"
          >
            Eigenes Raumkonzept erstellen
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </footer>

    </div>
  );
}

// ── Deactivated state ─────────────────────────────────────────────────────────

function DeactivatedPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="border-b border-sand/30">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center">
          <span className="font-headline text-base text-forest tracking-wide">
            Wellbeing Workbook
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-sand/20 border border-sand/30 flex items-center justify-center mx-auto mb-5">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-sand"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl text-forest mb-2">
            Konzept nicht verfügbar
          </h1>
          <p className="text-sm font-sans text-gray/50 leading-relaxed mb-6">
            Dieses Konzept ist nicht mehr öffentlich zugänglich oder der Link ist ungültig.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-forest text-white text-sm font-sans font-medium px-5 py-2.5 hover:bg-forest/90 transition-colors"
          >
            Eigenes Konzept erstellen
          </Link>
        </div>
      </div>
    </div>
  );
}
