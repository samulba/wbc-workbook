import {
  Waves, Circle, Leaf, Layers,
  Target, LayoutGrid, EyeOff, BookOpen,
  Zap, Sun, ArrowRight, Contrast,
  Sparkles, Palette, Shuffle, ImageIcon,
  Users, Sofa, Flame, MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RoomEffect } from "./effectsConfig";

export interface InspirationPrinciple {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export interface InspirationContent {
  tagline: string;
  description: string;
  keywords: string[];
  principles: InspirationPrinciple[];
  colorMood: string;
  accentColor: string; // Tailwind class
}

export const INSPIRATION: Record<RoomEffect, InspirationContent> = {
  ruhe_erholung: {
    tagline: "Ein Raum, der dich trägt",
    description:
      "Räume, die zur Ruhe einladen, sprechen die Sinne sanft an. Organische Formen, natürliche Materialien und eine gedämpfte Farbwelt schaffen eine Atmosphäre, in der der Geist loslassen kann.",
    keywords: [
      "Runde & weiche Formen",
      "Naturmaterialien",
      "Indirektes Licht",
      "Weiche Textilien",
      "Gedämpfte Farben",
      "Stille Zonen",
    ],
    principles: [
      {
        Icon: Circle,
        title: "Organische Formen",
        description:
          "Geschwungene Linien und weiche Konturen statt harter Kanten – sie wirken unbewusst beruhigend.",
      },
      {
        Icon: Leaf,
        title: "Naturmaterialien",
        description:
          "Holz, Leinen, Stein und natürliche Texturen schaffen Verbindung zur Natur und Geborgenheit.",
      },
      {
        Icon: Waves,
        title: "Indirektes Licht",
        description:
          "Warmes, gestreutes Licht ohne Blendung – es schafft Wärme und schont die Augen.",
      },
      {
        Icon: Layers,
        title: "Textur & Tiefe",
        description:
          "Mehrere übereinander gelegte Texturen (Kissen, Teppich, Überwurf) erzeugen Gemütlichkeit.",
      },
    ],
    colorMood: "mint",
    accentColor: "text-forest",
  },

  fokus_konzentration: {
    tagline: "Ein Raum, der deinen Geist schärft",
    description:
      "Konzentration entsteht in Räumen, die strukturiert, aufgeräumt und visuell ruhig sind. Jedes Element hat seinen Platz – Ablenkungen sind minimiert.",
    keywords: [
      "Klare Linien",
      "Funktionales Licht",
      "Aufgeräumte Flächen",
      "Strukturierte Ordnung",
      "Ruhige Farbwelt",
      "Minimale Ablenkung",
    ],
    principles: [
      {
        Icon: LayoutGrid,
        title: "Struktur & Ordnung",
        description:
          "Sichtbare Ordnungssysteme und klare Zonen helfen dem Geist, in den Arbeitsmodus zu wechseln.",
      },
      {
        Icon: Target,
        title: "Klare Geometrie",
        description:
          "Gerade Linien, rechte Winkel und klare Proportionen unterstützen fokussiertes Denken.",
      },
      {
        Icon: BookOpen,
        title: "Funktionales Licht",
        description:
          "Helles, gleichmäßiges Licht ohne Schatten direkt am Arbeitsbereich – Tageslicht optimal nutzen.",
      },
      {
        Icon: EyeOff,
        title: "Visuelle Stille",
        description:
          "Wenige, bewusst gewählte Objekte. Leere Flächen sind kein Mangel, sondern Qualität.",
      },
    ],
    colorMood: "blau-grau",
    accentColor: "text-[#3d5a68]",
  },

  energie_aktivitaet: {
    tagline: "Ein Raum, der dich in Bewegung bringt",
    description:
      "Aktivierende Räume nutzen Kontraste, lebhafte Farbimpulse und eine offene Struktur, die Bewegungsfreiheit ermöglicht. Sie laden ein, aktiv zu sein.",
    keywords: [
      "Klare Kontraste",
      "Aktivierende Farben",
      "Offener Raum",
      "Direktes Licht",
      "Dynamische Formen",
      "Bewegungsfreiheit",
    ],
    principles: [
      {
        Icon: Contrast,
        title: "Kontrastwirkung",
        description:
          "Hell-Dunkel-Kontraste und Farbkontraste wecken die Aufmerksamkeit und erzeugen Dynamik.",
      },
      {
        Icon: Zap,
        title: "Aktivierende Farbimpulse",
        description:
          "Warme Terracotta-, Ocker- oder kräftige Grüntöne als Akzente regen an und motivieren.",
      },
      {
        Icon: ArrowRight,
        title: "Räumliche Dynamik",
        description:
          "Offene Flächen, klare Wegeführung und flexible Möbel ermöglichen Bewegung im Raum.",
      },
      {
        Icon: Sun,
        title: "Helles direktes Licht",
        description:
          "Helles, klares Licht – idealerweise Tageslicht oder tageslichtweißes Kunstlicht – aktiviert.",
      },
    ],
    colorMood: "terracotta",
    accentColor: "text-terracotta",
  },

  kreativitaet_inspiration: {
    tagline: "Ein Raum, der deine Ideen beflügelt",
    description:
      "Kreative Räume leben von der Vielfalt. Unerwartete Kombinationen, inspirierende Objekte und offene Flächen zum Entfalten schaffen den idealen Nährboden für neue Ideen.",
    keywords: [
      "Offene Flächen",
      "Materialmix",
      "Inspirierende Objekte",
      "Warmes Licht",
      "Überraschende Details",
      "Flexibles Layout",
    ],
    principles: [
      {
        Icon: Palette,
        title: "Materialmix",
        description:
          "Verschiedene Materialien, Oberflächen und Texturen nebeneinander regen die Sinne an.",
      },
      {
        Icon: ImageIcon,
        title: "Inspirierende Objekte",
        description:
          "Kunst, Bücher, Pflanzen und persönliche Gegenstände als visuelle Impulsgeber im Raum.",
      },
      {
        Icon: Shuffle,
        title: "Flexibles Layout",
        description:
          "Räume zum Umgestalten – Möbel, die sich verschieben lassen, ermöglichen verschiedene Modi.",
      },
      {
        Icon: Sparkles,
        title: "Überraschungsmomente",
        description:
          "Ein unerwartetes Farb- oder Formelement weckt die Neugier und öffnet den Blick.",
      },
    ],
    colorMood: "sand",
    accentColor: "text-[#8a6030]",
  },

  begegnung_austausch: {
    tagline: "Ein Raum, der Menschen verbindet",
    description:
      "Räume für Begegnung sind einladend, offen und warm. Sie schaffen durch ihre Anordnung Augenhöhe, fördern Gespräche und laden zum Verweilen ein.",
    keywords: [
      "Einladende Sitzbereiche",
      "Offene Raumstruktur",
      "Warme Atmosphäre",
      "Sanftes Licht",
      "Natürliche Materialien",
      "Gemütliche Zonen",
    ],
    principles: [
      {
        Icon: Sofa,
        title: "Einladende Sitzgruppen",
        description:
          "Sitzbereiche im Halbkreis oder einander zugewandt – für echten Augenkontakt und Nähe.",
      },
      {
        Icon: Users,
        title: "Offene Raumstruktur",
        description:
          "Keine Barrieren zwischen Bereichen. Offene Grundrisse und niedrige Möbel schaffen Zugänglichkeit.",
      },
      {
        Icon: Flame,
        title: "Wärme & Atmosphäre",
        description:
          "Warme Farben, weiches Licht und natürliche Materialien erzeugen ein Gefühl von Geborgenheit.",
      },
      {
        Icon: MessageCircle,
        title: "Akustische Qualität",
        description:
          "Teppiche, Vorhänge und weiche Oberflächen schlucken Hall – für angenehme Gesprächsatmosphäre.",
      },
    ],
    colorMood: "forest",
    accentColor: "text-forest",
  },
};

export const FALLBACK_INSPIRATION: InspirationContent = {
  tagline: "Dein Raum, deine Welt",
  description:
    "Wähle im vorherigen Schritt eine Hauptwirkung, um passende Inspirationen zu sehen.",
  keywords: ["Harmonie", "Balance", "Wohlbefinden", "Persönlichkeit"],
  principles: [],
  colorMood: "sand",
  accentColor: "text-sand",
};
