"use client";

import Link from "next/link";
import { BrainCircuit, Heart, Sun, Sparkles, Coffee, Leaf, Moon, Flame } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Module1Data } from "@/lib/types/module1";

// Inspiration chips — tapping populates the next empty wish slot
const WISH_IDEAS: { label: string; Icon: React.ElementType }[] = [
  { label: "Ein Rückzugsort zum Auftanken", Icon: Leaf },
  { label: "Mehr Licht und Weite",          Icon: Sun },
  { label: "Ein Raum, der zu mir passt",    Icon: Heart },
  { label: "Platz für Hobbys & Kreativität",Icon: Sparkles },
  { label: "Gemütliche Lese-Ecke",          Icon: Coffee },
  { label: "Ruhe zum Durchatmen",           Icon: Moon },
  { label: "Mehr Lebendigkeit",             Icon: Flame },
];

interface Props {
  data: Module1Data;
  projectName: string;
  roomName: string;
  roomType: string;
  projectId?: string;
  roomId?: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  wohnzimmer:   "Wohnzimmer",
  schlafzimmer: "Schlafzimmer",
  arbeitszimmer:"Arbeitszimmer",
  kinderzimmer: "Kinderzimmer",
  badezimmer:   "Bad",
  kueche:       "Küche",
  esszimmer:    "Esszimmer",
  flur:         "Flur",
  keller:       "Keller",
  buero:        "Büro",
  yogaraum:     "Yogaraum",
  wellness:     "Wellness",
  studio:       "Studio",
  sonstiges:    "Sonstiges",
};

export function Step01({ data, projectName, roomName, roomType, projectId, roomId, onChange }: Props) {
  const wishes = data.wishes ?? ["", "", ""];

  function setWish(index: 0 | 1 | 2, value: string) {
    const next: [string, string, string] = [...wishes] as [string, string, string];
    next[index] = value;
    onChange({ wishes: next });
  }

  function applyIdea(idea: string) {
    // Fill the first empty wish slot; if all full, no-op
    const emptyIdx = [0, 1, 2].find((i) => !wishes[i]?.trim());
    if (emptyIdx === undefined) return;
    setWish(emptyIdx as 0 | 1 | 2, idea);
  }

  return (
    <div className="flex flex-col gap-10">

      {/* Project info card */}
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5 flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <p className="text-xs font-sans uppercase tracking-widest text-sand mb-1">Projekt</p>
          <p className="font-headline text-xl text-forest">{projectName}</p>
        </div>
        <div className="h-px sm:h-auto sm:w-px bg-sand/20" />
        <div className="flex-1">
          <p className="text-xs font-sans uppercase tracking-widest text-sand mb-1">Raum</p>
          <p className="font-headline text-xl text-forest">
            {roomName}
            {roomType && (
              <span className="ml-2 text-sm text-gray/50 font-sans font-normal">
                ({ROOM_TYPE_LABELS[roomType] ?? roomType})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Wishes */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Was wünschst du dir für diesen Raum?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Formuliere bis zu 3 Wünsche – ganz frei und ohne Einschränkungen.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {([0, 1, 2] as const).map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 shrink-0 rounded-full bg-mint/40 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-forest/60" />
              </span>
              <Input
                placeholder={
                  i === 0
                    ? "Mein erster Wunsch …"
                    : i === 1
                    ? "Mein zweiter Wunsch …"
                    : "Mein dritter Wunsch …"
                }
                value={wishes[i]}
                onChange={(e) => setWish(i, e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>

        {/* Inspiration chips */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-sand mb-2 font-sans">
            Keine Idee? Tippe auf einen Vorschlag
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WISH_IDEAS.map(({ label, Icon }) => {
              const already = wishes.some((w) => w === label);
              const allFull = wishes.every((w) => w.trim().length > 0);
              const disabled = already || allFull;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => applyIdea(label)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-sans transition-all ${
                    already
                      ? "bg-forest/10 border-forest/30 text-forest/70 cursor-default"
                      : disabled
                      ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-cream border-sand/40 text-forest/70 hover:border-forest/40 hover:bg-mint/10 hover:-translate-y-0.5 active:scale-95"
                  }`}
                >
                  <Icon className="w-3 h-3" strokeWidth={1.5} />
                  {label}
                  {already && <span className="text-forest/60">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KI-Analyse CTA */}
      {projectId && roomId && (
        <Link
          href={`/dashboard/projekte/${projectId}/raum/${roomId}/analyse`}
          className="flex items-center gap-3 rounded-xl border border-forest/30 bg-gradient-to-br from-forest/5 to-mint/10 px-4 py-3.5 hover:from-forest/10 hover:to-mint/20 hover:border-forest/50 hover:shadow-warm-sm transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-forest leading-snug">
              Lass deinen Raum analysieren
            </p>
            <p className="text-xs font-sans text-forest/60 mt-0.5">
              Die Wellbeing KI schaut sich ein Foto deines Raums an und gibt konkrete Empfehlungen
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-forest shrink-0 bg-cream border border-forest/20 rounded-full px-3 py-1.5 group-hover:bg-forest group-hover:text-cream transition-colors">
            Starten
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
      )}

      {/* Support */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Wer kann mich unterstützen?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Raumveränderung gelingt leichter mit Unterstützung.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            {
              key: "support_friends" as const,
              label: "Freunde & Familie",
              desc: "Menschen in meinem persönlichen Umfeld",
            },
            {
              key: "support_external" as const,
              label: "Externe Unterstützung",
              desc: "Interior-Designer, Coach oder Handwerker",
            },
          ].map(({ key, label, desc }) => {
            const checked = !!data[key];
            return (
              <label
                key={key}
                className={`flex items-start gap-4 rounded-xl border px-4 py-3.5 cursor-pointer transition-all ${
                  checked
                    ? "border-forest bg-forest/5"
                    : "border-sand/40 hover:border-mint/60 hover:bg-mint/5"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange({ [key]: e.target.checked })}
                  className="sr-only"
                />
                {/* Custom checkbox */}
                <span
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                    checked ? "bg-forest border-forest" : "border-sand/60"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-cream stroke-2">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-forest">{label}</span>
                  <span className="text-xs text-gray/50 font-sans mt-0.5">{desc}</span>
                </span>
              </label>
            );
          })}
        </div>

        {(data.support_friends || data.support_external) && (
          <Input
            label="Wen möchte ich um Unterstützung bitten?"
            placeholder="z. B. Schwester Lisa, Interior Designerin Frau Müller …"
            value={data.support_person ?? ""}
            onChange={(e) => onChange({ support_person: e.target.value })}
          />
        )}
      </div>

    </div>
  );
}
