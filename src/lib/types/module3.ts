import type { StepKind } from "@/components/module-wizard";

// ── Domain types ─────────────────────────────────────────────────────────────

export type LightPreset =
  | "kaminfeuer"
  | "sonnenaufgang"
  | "tageslicht"
  | "abendstimmung"
  | "custom";

export type WindowOrientation = "N" | "NO" | "O" | "SO" | "S" | "SW" | "W" | "NW";

export type LightFixture = {
  id:    string;
  name:  string;
  kind:  "deckenlicht" | "stehlampe" | "tischlampe" | "wandlampe" | "led_strip" | "kerze" | "sonstige";
  notes: string;
};

export type LampFavorite = {
  id:           string;
  title:        string;
  affiliateUrl: string;
  imageUrl?:    string;
};

export type LightScenarios = {
  morgen?: string[];
  tag?:    string[];
  abend?:  string[];
  nacht?:  string[];
};

export type Module3Data = {
  id:      string;
  room_id: string;

  // Step 1
  current_fixtures:   LightFixture[];
  baseline_photo_url: string | null;

  // Step 3
  window_orientation: WindowOrientation | null;
  daytime_usage:      string[];

  // Step 4 + 5
  preset:              LightPreset | null;
  light_mood:          string;
  light_warmth:        number | null;     // 0 (kalt) .. 100 (warm)
  light_brightness:    number | null;     // 0 (gedimmt) .. 100 (hell)
  studio_render_urls:  string[];

  // Step 6
  lamp_favorites: LampFavorite[];

  // Step 7
  scenarios: LightScenarios;

  // Housekeeping
  status:       string;
  current_step: number;
  step_notes:   Record<string, string>;
};

export type Module3Partial = Partial<Omit<Module3Data, "id" | "room_id">>;

// ── Step config ───────────────────────────────────────────────────────────────

export const STEP_CONFIG = [
  { step: 1, title: "Lichtsituation heute",    subtitle: "Ist-Zustand",             kind: "review"      as StepKind },
  { step: 2, title: "Licht verstehen",         subtitle: "Grundlagen",              kind: "learning"    as StepKind },
  { step: 3, title: "Tageslicht-Analyse",      subtitle: "Fenster & Tageszeit",     kind: "interactive" as StepKind },
  { step: 4, title: "Licht-Preset wählen",     subtitle: "Deine Stimmung",          kind: "interactive" as StepKind },
  { step: 5, title: "Light Temperature Studio", subtitle: "Feintuning mit KI",      kind: "interactive" as StepKind },
  { step: 6, title: "Leuchten-Empfehlungen",   subtitle: "Produkte zum Preset",     kind: "interactive" as StepKind },
  { step: 7, title: "Licht-Szenarien",         subtitle: "Timeline deines Tages",   kind: "review"      as StepKind },
] as const;

export const TOTAL_STEPS = STEP_CONFIG.length;

export const EMPTY_MODULE3_DATA: Omit<Module3Data, "id" | "room_id"> = {
  current_fixtures:   [],
  baseline_photo_url: null,
  window_orientation: null,
  daytime_usage:      [],
  preset:             null,
  light_mood:         "",
  light_warmth:       null,
  light_brightness:   null,
  studio_render_urls: [],
  lamp_favorites:     [],
  scenarios:          {},
  status:             "in_progress",
  current_step:       1,
  step_notes:         {},
};
