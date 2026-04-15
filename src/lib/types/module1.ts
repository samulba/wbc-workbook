import type { RoomEffect } from "@/app/dashboard/projekte/[id]/modul-1/_components/effectsConfig";

export type { RoomEffect };

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

  // ── Step 7+: future ────────────────────────────────────────
  desired_effects: string[];
  current_situation: string;
  color_preferences: string[];
  color_avoid: string[];
  color_notes: string;
  material_preferences: string[];
  material_avoid: string[];
  material_notes: string;
  moodboard_urls: string[];
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
  { step: 7,  title: "Moodboard",                  subtitle: "Visuelle Inspiration",   built: false },
  { step: 8,  title: "Möbel & Einrichtung",        subtitle: "Funktion & Form",        built: false },
  { step: 9,  title: "Licht",                      subtitle: "Helligkeit & Stimmung",  built: false },
  { step: 10, title: "Akustik & Duft",             subtitle: "Sinnesebene",            built: false },
  { step: 11, title: "Zusammenfassung",            subtitle: "Dein Raumkonzept",       built: false },
] as const;

export const TOTAL_STEPS = STEP_CONFIG.length;
