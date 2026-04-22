import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { FeedbackForm } from "./_components/FeedbackForm";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Feedback gefragt" };
export const dynamic = "force-dynamic";

interface RpcRow {
  question:         string;
  asker_name:       string;
  expires_at:       string;
  room_name:        string;
  room_type:        string;
  main_effect:      string;
  primary_colors:   string[];
  secondary_colors: string[];
  accent_color:     string;
  materials:        string[];
  light_mood:       string;
  special_elements: string;
  moodboard_urls:   string[];
}

const EFFECT_LABELS: Record<string, string> = {
  ruhe_erholung:          "Ruhe & Erholung",
  fokus_konzentration:    "Fokus & Konzentration",
  energie_aktivitaet:     "Energie & Aktivität",
  kreativitaet_inspiration: "Kreativität & Inspiration",
  begegnung_austausch:    "Begegnung & Austausch",
};

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer:    "Wohnzimmer",
  schlafzimmer:  "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer",
  kinderzimmer:  "Kinderzimmer",
  badezimmer:    "Bad",
  kueche:        "Küche",
  esszimmer:     "Esszimmer",
  flur:          "Flur",
  yogaraum:      "Yogaraum",
  wellness:      "Wellness",
  studio:        "Studio",
  sonstiges:     "Raum",
};

export default async function FeedbackPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_feedback_request", { p_token: params.token });
  const row = (data as RpcRow[] | null)?.[0];

  if (!row) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-forest/10 p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-5 h-5 text-terracotta" strokeWidth={1.5} />
          </div>
          <h1 className="font-headline text-xl text-forest mb-2">Link nicht mehr aktiv</h1>
          <p className="text-sm text-gray-600">
            Dieser Feedback-Link ist abgelaufen oder wurde deaktiviert.
            Frag die Person, dir einen neuen Link zu schicken.
          </p>
        </div>
      </div>
    );
  }

  const hasPalette = row.primary_colors.length > 0 || row.secondary_colors.length > 0 || row.accent_color;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-forest text-white">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-mint mb-3">
            Frag einen Freund
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl leading-tight mb-3">
            {row.asker_name} fragt dich um Rat
          </h1>
          <p className="text-lg text-mint/90 italic border-l-2 border-mint pl-4">
            „{row.question}“
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 space-y-10">
        {/* Context — read-only design snapshot */}
        <section className="bg-white rounded-2xl border border-forest/10 p-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-forest/50 mb-1">Raum</p>
            <p className="font-headline text-xl text-forest">
              {row.room_name}
              <span className="text-sm text-forest/60 font-sans ml-2">· {ROOM_LABELS[row.room_type] ?? row.room_type}</span>
            </p>
          </div>

          {row.main_effect && (
            <div>
              <p className="text-xs uppercase tracking-widest text-forest/50 mb-1">Gewünschte Wirkung</p>
              <p className="text-forest font-medium">{EFFECT_LABELS[row.main_effect] ?? row.main_effect}</p>
            </div>
          )}

          {hasPalette && (
            <div>
              <p className="text-xs uppercase tracking-widest text-forest/50 mb-2">Farbpalette</p>
              <div className="flex flex-wrap gap-2">
                {row.primary_colors.map((c, i) => (
                  <ColorSwatch key={`p-${i}`} color={c} label="Primär" />
                ))}
                {row.secondary_colors.map((c, i) => (
                  <ColorSwatch key={`s-${i}`} color={c} label="Sekundär" />
                ))}
                {row.accent_color && <ColorSwatch color={row.accent_color} label="Akzent" />}
              </div>
            </div>
          )}

          {row.materials.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-forest/50 mb-2">Materialien</p>
              <div className="flex flex-wrap gap-1.5">
                {row.materials.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-sand/20 text-forest text-xs font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {row.light_mood && (
            <div>
              <p className="text-xs uppercase tracking-widest text-forest/50 mb-1">Lichtstimmung</p>
              <p className="text-forest/80 text-sm">{row.light_mood}</p>
            </div>
          )}

          {row.special_elements && (
            <div>
              <p className="text-xs uppercase tracking-widest text-forest/50 mb-1">Besondere Elemente</p>
              <p className="text-forest/80 text-sm whitespace-pre-wrap">{row.special_elements}</p>
            </div>
          )}

          {row.moodboard_urls.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-forest/50 mb-2">Moodboard</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {row.moodboard_urls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-forest/5">
                    <Image
                      src={url}
                      alt={`Moodboard ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Feedback form */}
        <section>
          <FeedbackForm token={params.token} />
        </section>

        <p className="text-center text-xs text-forest/50 pt-4">
          Gültig bis {new Date(row.expires_at).toLocaleDateString("de-DE")}
        </p>
      </main>
    </div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  const isHex = /^#?[0-9a-fA-F]{6}$/.test(color);
  const bg    = isHex ? (color.startsWith("#") ? color : `#${color}`) : undefined;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-lg border border-forest/10"
        style={{ background: bg ?? "#e5e7eb" }}
        title={color}
      />
      <span className="text-[9px] uppercase tracking-wider text-forest/50">{label}</span>
    </div>
  );
}
