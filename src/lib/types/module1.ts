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

  // ── Step 3: Raumwirkung (future) ───────────────────────────
  desired_effects: string[];
  current_situation: string;

  // ── Step 4: Farbwelt (future) ──────────────────────────────
  color_preferences: string[];
  color_avoid: string[];
  color_notes: string;

  // ── Step 5: Materialien (future) ───────────────────────────
  material_preferences: string[];
  material_avoid: string[];
  material_notes: string;

  // ── Step 6: Moodboard (future) ─────────────────────────────
  moodboard_urls: string[];
  moodboard_notes: string;

  notes: string;
};

export type Module1Partial = Partial<Omit<Module1Data, "id" | "room_id">>;

export const STEP_CONFIG = [
  { step: 1,  title: "Projekt-Steckbrief",   subtitle: "Deine Vision",         built: true  },
  { step: 2,  title: "Warum verändern?",      subtitle: "Deine Motivation",     built: true  },
  { step: 3,  title: "Raumwirkung",           subtitle: "Atmosphäre & Gefühl",  built: false },
  { step: 4,  title: "Farbwelt",              subtitle: "Deine Palette",        built: false },
  { step: 5,  title: "Materialien",           subtitle: "Haptik & Oberflächen", built: false },
  { step: 6,  title: "Moodboard",             subtitle: "Visuelle Inspiration", built: false },
  { step: 7,  title: "Möbel & Einrichtung",   subtitle: "Funktion & Form",      built: false },
  { step: 8,  title: "Licht",                 subtitle: "Helligkeit & Stimmung",built: false },
  { step: 9,  title: "Akustik & Duft",        subtitle: "Sinnesebene",          built: false },
  { step: 10, title: "Produkte & Budget",     subtitle: "Deine Auswahl",        built: false },
  { step: 11, title: "Zusammenfassung",       subtitle: "Dein Raumkonzept",     built: false },
] as const;

export const TOTAL_STEPS = STEP_CONFIG.length;
