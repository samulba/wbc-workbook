import { Waves, Target, Zap, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoomEffect =
  | "ruhe_erholung"
  | "fokus_konzentration"
  | "energie_aktivitaet"
  | "kreativitaet_inspiration"
  | "begegnung_austausch";

export interface EffectConfig {
  value: RoomEffect;
  label: string;
  keywords: string;
  description: string;
  Icon: LucideIcon;
  // Info card (Step 3)
  infoBg: string;
  infoBorder: string;
  infoIconBg: string;
  infoIconColor: string;
  // Selection card (Step 4) – idle vs selected
  cardBg: string;
  cardBorder: string;
  selectedBg: string;
  selectedBorder: string;
  selectedRing: string;
  selectedIconBg: string;
}

export const EFFECTS: EffectConfig[] = [
  {
    value: "ruhe_erholung",
    label: "Ruhe & Erholung",
    keywords: "Entspannen · Abschalten · Auftanken",
    description:
      "Ein Raum, der dir Erholung schenkt – er lädt ein, loszulassen, durchzuatmen und neue Kraft zu schöpfen.",
    Icon: Waves,
    infoBg:         "bg-mint/10",
    infoBorder:     "border-mint/30",
    infoIconBg:     "bg-mint/20",
    infoIconColor:  "text-forest",
    cardBg:         "bg-cream",
    cardBorder:     "border-sand/40",
    selectedBg:     "bg-mint/10",
    selectedBorder: "border-forest",
    selectedRing:   "ring-2 ring-mint/40",
    selectedIconBg: "bg-mint/20",
  },
  {
    value: "fokus_konzentration",
    label: "Fokus & Konzentration",
    keywords: "Arbeiten · Klarheit · Struktur",
    description:
      "Ein Raum, der deinen Geist schärft – klar strukturiert, ohne Ablenkung, perfekt für konzentriertes Arbeiten.",
    Icon: Target,
    infoBg:         "bg-[#e9eff2]/80",
    infoBorder:     "border-[#c0d0d8]/50",
    infoIconBg:     "bg-[#d0e0e8]/60",
    infoIconColor:  "text-[#3d5a68]",
    cardBg:         "bg-cream",
    cardBorder:     "border-sand/40",
    selectedBg:     "bg-[#e9eff2]/80",
    selectedBorder: "border-[#3d5a68]",
    selectedRing:   "ring-2 ring-[#3d5a68]/20",
    selectedIconBg: "bg-[#d0e0e8]/70",
  },
  {
    value: "energie_aktivitaet",
    label: "Energie & Aktivität",
    keywords: "Bewegung · Motivation · Dynamik",
    description:
      "Ein Raum, der dich in Schwung bringt – belebend, motivierend und voller Energie für alles, was du anpackst.",
    Icon: Zap,
    infoBg:         "bg-terracotta/8",
    infoBorder:     "border-terracotta/25",
    infoIconBg:     "bg-terracotta/15",
    infoIconColor:  "text-terracotta",
    cardBg:         "bg-cream",
    cardBorder:     "border-sand/40",
    selectedBg:     "bg-terracotta/8",
    selectedBorder: "border-terracotta",
    selectedRing:   "ring-2 ring-terracotta/20",
    selectedIconBg: "bg-terracotta/15",
  },
  {
    value: "kreativitaet_inspiration",
    label: "Kreativität & Inspiration",
    keywords: "Ideen · Gestalten · Umsetzen",
    description:
      "Ein Raum, der deine Kreativität entfacht – voller Impulse, der dein Denken beflügelt und neue Ideen wachsen lässt.",
    Icon: Sparkles,
    infoBg:         "bg-sand/20",
    infoBorder:     "border-sand/50",
    infoIconBg:     "bg-sand/30",
    infoIconColor:  "text-[#8a6030]",
    cardBg:         "bg-cream",
    cardBorder:     "border-sand/40",
    selectedBg:     "bg-sand/20",
    selectedBorder: "border-[#8a6030]",
    selectedRing:   "ring-2 ring-sand/50",
    selectedIconBg: "bg-sand/30",
  },
  {
    value: "begegnung_austausch",
    label: "Begegnung & Austausch",
    keywords: "Gespräche · Verbindung · Gemeinschaft",
    description:
      "Ein Raum, der Menschen zusammenbringt – einladend, warm und offen für echte Begegnungen und Gespräche.",
    Icon: Users,
    infoBg:         "bg-forest/8",
    infoBorder:     "border-forest/20",
    infoIconBg:     "bg-forest/15",
    infoIconColor:  "text-forest",
    cardBg:         "bg-cream",
    cardBorder:     "border-sand/40",
    selectedBg:     "bg-forest/8",
    selectedBorder: "border-forest",
    selectedRing:   "ring-2 ring-forest/20",
    selectedIconBg: "bg-forest/15",
  },
];
