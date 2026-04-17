import type { RoomEffect } from "@/app/dashboard/projekte/[id]/modul-1/_components/effectsConfig";

export type { RoomEffect };

// ── Moodboard canvas items ────────────────────────────────────────────────────
export type CanvasItemType = "image" | "color" | "note";
export type CanvasItemFrame = "none" | "white" | "polaroid";

export interface CanvasItem {
  id:     string;
  type:   CanvasItemType;
  x:      number;
  y:      number;
  w:      number;
  h:      number;
  z:      number;
  src?:   string;   // image URL
  color?: string;   // hex for "color" cards
  text?:  string;   // for "note" items
  frame?: CanvasItemFrame;
}

export type Module1Data = {
  id: string;
  room_id: string;

  // ── Step 1: Projekt-Steckbrief ─────────────────────────────
  wishes: [string, string, string];
  support_friends: boolean;
  support_external: boolean;
  support_person: string;

  // ── Step 2: Warum verändern? ───────────────────────────────
  current_issues: string;
  more_of: string;
  less_of: string;
  change_reason: string;

  // ── Step 3: Raumwirkungen Info (no input) ──────────────────
  // (no fields – pure info step)

  // ── Step 4: Hauptwirkung ───────────────────────────────────
  main_effect: RoomEffect | null;

  // ── Step 5: Exkurs Farbwelten (no input) ──────────────────
  // (no fields – pure info step)

  // ── Step 6: Farbwelt definieren ────────────────────────────
  primary_colors: string[];
  secondary_colors: string[];
  accent_color: string;
  materials: string[];

  // ── Step 7: Inspiration (no input) ────────────────────────
  // (no fields – pure info step)

  // ── Step 8: Raum-Briefing ──────────────────────────────────
  light_mood: string;
  light_warmth: number | null;        // 0 (kalt) .. 100 (warm)
  light_brightness: number | null;    // 0 (gedimmt) .. 100 (hell)
  special_elements: string;
  special_tags: string[];             // multi-select idea chips

  // ── Step 9: Moodboard erstellen (no input) ────────────────
  // (no fields – pure info step)

  // ── Step 10: Moodboard-Prompt / Canvas ─────────────────────
  moodboard_prompt: string;
  moodboard_urls: string[];
  moodboard_canvas: CanvasItem[];

  // ── Step 11: Abschluss ─────────────────────────────────────
  status: string;
  current_step: number;

  // ── Step notes (per-step personal notes) ──────────────────
  step_notes: Record<string, string>;

  // ── Legacy / future fields ─────────────────────────────────
  desired_effects: string[];
  current_situation: string;
  color_preferences: string[];
  color_avoid: string[];
  color_notes: string;
  material_preferences: string[];
  material_avoid: string[];
  material_notes: string;
  moodboard_notes: string;
  notes: string;
};

export type Module1Partial = Partial<Omit<Module1Data, "id" | "room_id">>;

export const STEP_CONFIG = [
  { step: 1,  title: "Projekt-Steckbrief",        subtitle: "Deine Vision",           built: true  },
  { step: 2,  title: "Warum verändern?",           subtitle: "Deine Motivation",       built: true  },
  { step: 3,  title: "Raumwirkungen verstehen",    subtitle: "Atmosphäre & Gefühl",    built: true  },
  { step: 4,  title: "Hauptwirkung festlegen",     subtitle: "Deine Wahl",             built: true  },
  { step: 5,  title: "Exkurs: Farbwelten",         subtitle: "Farbsystem & Inspiration", built: true },
  { step: 6,  title: "Deine Farbwelt",             subtitle: "Farben & Materialien",   built: true  },
  { step: 7,  title: "Inspiration für deine Wirkung", subtitle: "Design-Merkmale",      built: true  },
  { step: 8,  title: "Dein Raum-Briefing",         subtitle: "Zusammenfassung & Licht", built: true  },
  { step: 9,  title: "Moodboard erstellen",          subtitle: "Dein Konzept",           built: true  },
  { step: 10, title: "Moodboard-Prompt",            subtitle: "KI-Vorlage",             built: true  },
  { step: 11, title: "Deine Raumidee steht!",       subtitle: "Modul 1 abgeschlossen",  built: true  },
] as const;

export const TOTAL_STEPS = STEP_CONFIG.length;

export const EMPTY_MODULE1_DATA: Omit<Module1Data, "id" | "room_id"> = {
  wishes:              ["", "", ""],
  support_friends:     false,
  support_external:    false,
  support_person:      "",
  current_issues:      "",
  more_of:             "",
  less_of:             "",
  change_reason:       "",
  main_effect:         null,
  primary_colors:      ["", ""],
  secondary_colors:    ["", ""],
  accent_color:        "",
  materials:           [],
  light_mood:          "",
  light_warmth:        null,
  light_brightness:    null,
  special_elements:    "",
  special_tags:        [],
  moodboard_prompt:    "",
  moodboard_urls:      [],
  moodboard_canvas:    [],
  status:              "in_progress",
  current_step:        1,
  step_notes:          {},
  desired_effects:     [],
  current_situation:   "",
  color_preferences:   [],
  color_avoid:         [],
  color_notes:         "",
  material_preferences:[],
  material_avoid:      [],
  material_notes:      "",
  moodboard_notes:     "",
  notes:               "",
};
