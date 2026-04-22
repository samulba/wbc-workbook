"use client";

import { Thermometer, Sun, Palette } from "lucide-react";

const CARDS = [
  {
    Icon:   Thermometer,
    title:  "Farbtemperatur · Kelvin (K)",
    sub:    "Warm ↔ Kühl",
    desc:   "Kerzenschein ≈ 1.800 K, warmes Wohnlicht ≈ 2.700 K, Tageslicht ≈ 5.500 K. Niedrige Werte wirken gemütlich und beruhigend, hohe Werte konzentriert und wach.",
    band:   "linear-gradient(90deg, #ffc88c 0%, #f5e7c2 35%, #f5f0e1 55%, #e6ecf5 80%, #a6cade 100%)",
    ticks:  ["1.800 K", "2.700 K", "4.000 K", "5.500 K", "6.500 K"],
  },
  {
    Icon:   Sun,
    title:  "Lichtstärke · Lumen (lm)",
    sub:    "Gedimmt ↔ Hell",
    desc:   "Lumen beschreibt die gesamte Lichtmenge. Ein Esstisch braucht ~400 lm, ein Arbeitsplatz ~1.000 lm. Mehrere schwächere Quellen wirken oft angenehmer als eine starke.",
    band:   "linear-gradient(90deg, #2a2a2a 0%, #4d4438 30%, #a89e86 60%, #ead9a9 85%, #fdf6e3 100%)",
    ticks:  ["200 lm", "400 lm", "700 lm", "1.000 lm", "1.500 lm"],
  },
  {
    Icon:   Palette,
    title:  "Farbwiedergabe · CRI / Ra",
    sub:    "Hochwertig ab Ra 90",
    desc:   "Der CRI-Wert zeigt, wie natürlich Farben unter dem Licht wirken. Für Wohnräume mindestens Ra 90 wählen – sonst erscheinen Textilien und Hauttöne flach oder falsch.",
    band:   "linear-gradient(90deg, #9c8a6a 0%, #c8b890 40%, #e6d9b3 70%, #f5eed6 100%)",
    ticks:  ["Ra 70", "Ra 80", "Ra 90", "Ra 95", "Ra 100"],
  },
] as const;

export function Step02() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray/60 font-sans leading-relaxed">
        Drei Begriffe, mit denen du ab sofort wie eine Licht-Expertin sprichst.
        Scrolle durch – danach treffen wir gemeinsam die richtige Wahl für deinen Raum.
      </p>

      <div className="flex flex-col gap-4">
        {CARDS.map(({ Icon, title, sub, desc, band, ticks }) => (
          <div
            key={title}
            className="rounded-2xl border border-sand/40 bg-white p-5 flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-forest/70" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline text-base text-forest leading-snug">{title}</h4>
                <p className="text-[11px] uppercase tracking-widest text-sand font-sans mt-0.5">{sub}</p>
              </div>
            </div>

            <p className="text-sm text-gray/60 font-sans leading-relaxed">{desc}</p>

            <div className="flex flex-col gap-1.5">
              <div className="h-3 rounded-full border border-forest/10" style={{ background: band }} />
              <div className="flex justify-between text-[10px] text-gray/45 font-mono">
                {ticks.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
