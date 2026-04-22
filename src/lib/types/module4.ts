import type { StepKind } from "@/components/module-wizard";

export type ScentMethod = "diffuser" | "kerze" | "pflanze" | "raumspray" | "keine";
export type ReverbLevel = "niedrig" | "mittel" | "hoch";

export type PlantSuggestion = {
  id:    string;
  name:  string;
  notes: string;
};

export type RitualBlock = "morgen" | "tag" | "abend" | "wochenende";

export type Ritual = {
  id:       string;
  block:    RitualBlock;
  title:    string;
  senses:   string[];      // which senses are anchored (sehen / hören / riechen / fühlen / schmecken)
  notes:    string;
};

export type Module4Data = {
  id:      string;
  room_id: string;

  // Step 2: Akustik
  reverb_level:       ReverbLevel | null;
  acoustic_measures:  string[];

  // Step 3: Duft & Luft
  scent_method:       ScentMethod | null;
  scent_notes:        string;
  plant_suggestions:  PlantSuggestion[];

  // Step 4: Haptik
  preferred_materials: string[];
  rejected_materials:  string[];

  // Step 5: Ritual-Builder
  rituals: Ritual[];

  // Housekeeping
  status:       string;
  current_step: number;
  step_notes:   Record<string, string>;
};

export type Module4Partial = Partial<Omit<Module4Data, "id" | "room_id">>;

export const STEP_CONFIG = [
  { step: 1, title: "Die 5 Sinne",           subtitle: "Grundlagen",         kind: "learning"    as StepKind },
  { step: 2, title: "Akustik",               subtitle: "Hall & Ruhe",        kind: "interactive" as StepKind },
  { step: 3, title: "Duft & Luft",           subtitle: "Raumgefühl",         kind: "interactive" as StepKind },
  { step: 4, title: "Haptik",                subtitle: "Materialen fühlen",  kind: "interactive" as StepKind },
  { step: 5, title: "Ritual-Builder",        subtitle: "Tages-Rhythmus",     kind: "interactive" as StepKind },
  { step: 6, title: "Sinnes-Zusammenfassung", subtitle: "Dein Konzept",      kind: "review"      as StepKind },
] as const;

export const TOTAL_STEPS = STEP_CONFIG.length;

export const EMPTY_MODULE4_DATA: Omit<Module4Data, "id" | "room_id"> = {
  reverb_level:        null,
  acoustic_measures:   [],
  scent_method:        null,
  scent_notes:         "",
  plant_suggestions:   [],
  preferred_materials: [],
  rejected_materials:  [],
  rituals:             [],
  status:              "in_progress",
  current_step:        1,
  step_notes:          {},
};
