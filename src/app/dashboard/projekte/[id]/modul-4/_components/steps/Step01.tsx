"use client";

import { Eye, Ear, Flower, Hand, Apple } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SenseCard = {
  label:   string;
  tagline: string;
  desc:    string;
  examples: string[];
  Icon:    LucideIcon;
  tone:    string;
};

const SENSES: SenseCard[] = [
  {
    label:   "Sehen",
    tagline: "Das, was ins Auge fällt",
    desc:    "Farben, Formen, Licht, Proportionen. Der Sehsinn entscheidet in Sekundenbruchteilen, ob ein Raum stimmig wirkt.",
    examples: ["Farbharmonie", "Ordnung vs. Leere", "Sichtlinien", "Kunst und Akzente"],
    Icon:    Eye,
    tone:    "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label:   "Hören",
    tagline: "Der unterschätzte Sinn",
    desc:    "Nachhall, Hintergrundgeräusche und bewusste Klänge. Ein Raum, der zu hallig klingt, fühlt sich nie ganz gemütlich an.",
    examples: ["Teppiche & Vorhänge", "Bücherregal als Absorber", "Musik-Routinen", "Leiser Luftzug"],
    Icon:    Ear,
    tone:    "bg-forest/8 text-forest border-forest/20",
  },
  {
    label:   "Riechen",
    tagline: "Das Gefühls-Gedächtnis",
    desc:    "Düfte wirken direkt aufs limbische System. Kein anderer Sinn erzeugt so schnell Wohlgefühl oder Unbehagen.",
    examples: ["Pflanzen-Aroma", "Ätherische Öle", "Frische Luft", "Stoffwasch-Routinen"],
    Icon:    Flower,
    tone:    "bg-pink-50 text-pink-700 border-pink-100",
  },
  {
    label:   "Fühlen",
    tagline: "Haptik und Temperatur",
    desc:    "Welche Oberflächen berührst du täglich? Wolle, Leinen, Holz, Stein — jede Textur lädt zum Bleiben (oder Weggehen) ein.",
    examples: ["Leinen-Vorhänge", "Barfuß-Böden", "Grobstrick-Decken", "Kühle Keramik"],
    Icon:    Hand,
    tone:    "bg-sand/20 text-[#8a6030] border-sand/40",
  },
  {
    label:   "Schmecken",
    tagline: "Indirekt, aber wichtig",
    desc:    "Trinke ich in diesem Raum bewusst? Gibt es einen Platz für eine kleine Teestation? Der 5. Sinn schwingt in den Ritualen mit.",
    examples: ["Kaffee-Ecke", "Kräuter-Topf", "Teegeschirr-Regal", "Kleines Obstschale"],
    Icon:    Apple,
    tone:    "bg-amber-50 text-amber-700 border-amber-100",
  },
];

export function Step01() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray/60 font-sans leading-relaxed">
        Ein Raum wirkt über alle fünf Sinne — nicht nur über Augen. Hier ein Überblick,
        wie jeder Sinn auf dein Wohlbefinden einzahlt. Scrolle durch, danach gehen wir
        Sinn für Sinn durch.
      </p>

      <div className="flex flex-col gap-4">
        {SENSES.map(({ label, tagline, desc, examples, Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-sand/40 bg-white p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${tone}`}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline text-lg text-forest leading-tight">{label}</h4>
                <p className="text-[11px] uppercase tracking-widest text-sand font-sans mt-0.5">{tagline}</p>
              </div>
            </div>
            <p className="text-sm text-gray/60 font-sans leading-relaxed">{desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {examples.map((ex) => (
                <span key={ex} className="text-[11px] font-sans text-forest/60 bg-cream border border-sand/30 px-2.5 py-0.5 rounded-full">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
