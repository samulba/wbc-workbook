import { Mountain, Leaf, Flower, Zap, Hammer, Crown, Square, TreePine, Minimize2, Shuffle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InteriorStyle } from "@/lib/types/module2";

export type StyleConfig = {
  value:    InteriorStyle;
  label:    string;
  tagline:  string;
  desc:     string;
  palette:  string[];     // hex swatches — used in the card preview
  keywords: string[];
  Icon:     LucideIcon;
};

export const STYLES: StyleConfig[] = [
  {
    value: "skandi",
    label: "Skandinavisch",
    tagline: "Hell · Klar · Hyggelig",
    desc: "Helle Hölzer, cleane Linien, viel Licht und eine warme, gemütliche Grundstimmung.",
    palette: ["#f5efe6", "#d9cbb3", "#9aa39b", "#3a4f3d"],
    keywords: ["hell", "holz", "gemütlich", "minimal"],
    Icon: Mountain,
  },
  {
    value: "japandi",
    label: "Japandi",
    tagline: "Ruhig · Reduziert · Natur",
    desc: "Skandinavische Klarheit trifft japanische Zen-Ästhetik. Matt, funktional, erdig.",
    palette: ["#e9e1d3", "#b9a78a", "#6b5c48", "#2c2a24"],
    keywords: ["zen", "natur", "minimal", "erdig"],
    Icon: Leaf,
  },
  {
    value: "boho",
    label: "Boho",
    tagline: "Frei · Warm · Vielfältig",
    desc: "Muster, Textilien, Pflanzen. Warme Erdtöne gemischt mit lebendigen Farbakzenten.",
    palette: ["#e8c9a0", "#c97d5f", "#8c4f3b", "#3e2e1e"],
    keywords: ["textilien", "pflanzen", "warm", "mix"],
    Icon: Flower,
  },
  {
    value: "mid_century",
    label: "Mid-Century",
    tagline: "Retro · Stilvoll · Präzise",
    desc: "Schlanke Möbel der 50er/60er, Nussholz, grafische Formen, warme Akzentfarben.",
    palette: ["#d9b79c", "#a67551", "#d9693b", "#2e3d35"],
    keywords: ["retro", "holz", "grafisch", "akzent"],
    Icon: Zap,
  },
  {
    value: "industrial",
    label: "Industrial",
    tagline: "Urban · Roh · Kontraststark",
    desc: "Sichtbeton, Stahl, offene Leitungen, recycelte Hölzer, Edison-Glühlampen.",
    palette: ["#d7d0c2", "#7a7066", "#3a3631", "#1a1916"],
    keywords: ["beton", "stahl", "loft", "kontrast"],
    Icon: Hammer,
  },
  {
    value: "classic",
    label: "Klassisch",
    tagline: "Elegant · Zeitlos · Strukturiert",
    desc: "Hochwertige Textilien, Stuck, dezente Farben, symmetrische Kompositionen.",
    palette: ["#f0e8d9", "#c8b591", "#6b4d38", "#2e1f16"],
    keywords: ["zeitlos", "edel", "symmetrie", "stuck"],
    Icon: Crown,
  },
  {
    value: "modern",
    label: "Modern",
    tagline: "Klar · Funktional · Offen",
    desc: "Geradlinige Formen, offene Grundrisse, neutrale Farben, maximale Funktionalität.",
    palette: ["#f7f5f2", "#c6c2ba", "#6a6761", "#1f1e1d"],
    keywords: ["clean", "neutral", "offen", "funktional"],
    Icon: Square,
  },
  {
    value: "rustic",
    label: "Rustikal",
    tagline: "Gemütlich · Natürlich · Warm",
    desc: "Massivholz, raue Oberflächen, Leinen und Wolle, Kaminstimmung.",
    palette: ["#efe3cf", "#b48b5c", "#6a4a2b", "#35261a"],
    keywords: ["massivholz", "leinen", "kamin", "warm"],
    Icon: TreePine,
  },
  {
    value: "minimalist",
    label: "Minimalistisch",
    tagline: "Weniger · Mehr · Klarheit",
    desc: "Strikte Reduktion, viel Leere, wenige aber hochwertige Objekte, monochrome Palette.",
    palette: ["#fafaf8", "#dad6cf", "#8a8679", "#2d2a25"],
    keywords: ["reduktion", "leere", "mono", "ruhe"],
    Icon: Minimize2,
  },
  {
    value: "eclectic",
    label: "Eklektisch",
    tagline: "Persönlich · Mutig · Kuratiert",
    desc: "Bewusste Mischung aus Epochen und Stilen — funktioniert nur mit kuratiertem Auge.",
    palette: ["#e9ceb0", "#c78855", "#4d6a4a", "#2e2347"],
    keywords: ["mix", "mutig", "kuratiert", "persönlich"],
    Icon: Shuffle,
  },
];

export const STYLE_MAP: Record<InteriorStyle, StyleConfig> =
  Object.fromEntries(STYLES.map((s) => [s.value, s])) as Record<InteriorStyle, StyleConfig>;
