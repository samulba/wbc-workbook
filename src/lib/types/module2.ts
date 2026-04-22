import type { StepKind } from "@/components/module-wizard";

export type InteriorStyle =
  | "skandi" | "japandi" | "boho" | "mid_century" | "industrial"
  | "classic" | "modern" | "rustic" | "minimalist" | "eclectic";

export type Zone = {
  id:    string;
  label: string;           // user-given name, e.g. "Leseecke"
  kind:  string;           // "entspannung" | "arbeit" | "schlaf" | "essen" | ...
  notes: string;
};

export type FurnitureEntry = {
  id:        string;
  name:      string;
  category:  string;      // "sofa" | "tisch" | "regal" | ...
  condition: "keep" | "remove" | "wish";
  notes:     string;
};

export type FurnitureFavorite = {
  id:           string;
  title:        string;
  affiliateUrl: string;
  imageUrl?:    string;
};

export type LayoutPlacement = {
  id:      string;    // stable id matching furniture entry or ad-hoc
  label:   string;    // "Sofa", "Esstisch", ...
  gridX:   number;    // 0..cols-1
  gridY:   number;    // 0..rows-1
};

export type Module2Data = {
  id:      string;
  room_id: string;

  // Step 1
  preferred_styles: InteriorStyle[];
  rejected_styles:  InteriorStyle[];
  primary_style:    InteriorStyle | null;

  // Step 2
  palette_primary:   string[];
  palette_secondary: string[];
  palette_accent:    string;

  // Step 3
  width_cm:      number | null;
  length_cm:     number | null;
  height_cm:     number | null;
  floorplan_svg: string | null;

  // Step 4
  zones: Zone[];

  // Step 5
  furniture_keep:   FurnitureEntry[];
  furniture_remove: FurnitureEntry[];
  furniture_wish:   FurnitureEntry[];

  // Step 6
  furniture_favorites: FurnitureFavorite[];

  // Step 7
  layout_canvas: LayoutPlacement[];

  // Step 8
  render_urls:   string[];
  render_prompt: string;

  // Housekeeping
  status:       string;
  current_step: number;
  step_notes:   Record<string, string>;
};

export type Module2Partial = Partial<Omit<Module2Data, "id" | "room_id">>;

export const STEP_CONFIG = [
  { step: 1, title: "Stil-Tinder",         subtitle: "Dein Look",              kind: "interactive" as StepKind },
  { step: 2, title: "Farbwelt",             subtitle: "Palette & Akzente",      kind: "interactive" as StepKind },
  { step: 3, title: "Maße & Grundriss",     subtitle: "Dimensionen",            kind: "interactive" as StepKind },
  { step: 4, title: "Zonen definieren",     subtitle: "Nutzungs-Bereiche",      kind: "interactive" as StepKind },
  { step: 5, title: "Möbel-Inventar",       subtitle: "Behalten · Weg · Neu",   kind: "interactive" as StepKind },
  { step: 6, title: "Möbel-Tinder",         subtitle: "Wunschliste",            kind: "interactive" as StepKind },
  { step: 7, title: "Layout-Canvas",        subtitle: "Anordnung planen",       kind: "interactive" as StepKind },
  { step: 8, title: "KI-Render",            subtitle: "Dein Raum neu gedacht",  kind: "interactive" as StepKind },
] as const;

export const TOTAL_STEPS = STEP_CONFIG.length;

export const EMPTY_MODULE2_DATA: Omit<Module2Data, "id" | "room_id"> = {
  preferred_styles:    [],
  rejected_styles:     [],
  primary_style:       null,
  palette_primary:     [],
  palette_secondary:   [],
  palette_accent:      "",
  width_cm:            null,
  length_cm:           null,
  height_cm:           null,
  floorplan_svg:       null,
  zones:               [],
  furniture_keep:      [],
  furniture_remove:    [],
  furniture_wish:      [],
  furniture_favorites: [],
  layout_canvas:       [],
  render_urls:         [],
  render_prompt:       "",
  status:              "in_progress",
  current_step:        1,
  step_notes:          {},
};
