-- ============================================================================
-- Achievements & Badges System
-- ============================================================================

-- ── 1. achievements (catalog) ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.achievements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key               TEXT        NOT NULL UNIQUE,
  name              TEXT        NOT NULL,
  description       TEXT        NOT NULL,
  icon              TEXT        NOT NULL DEFAULT 'Trophy',          -- lucide icon name
  category          TEXT        NOT NULL,                            -- erste_schritte | design | visuell | meisterklasse | engagement | geheim
  points            INTEGER     NOT NULL DEFAULT 10,
  requirement_type  TEXT        NOT NULL,                            -- see service: account_created | project_count | room_count | module1_complete | moodboard_urls | before_after | render_count | feedback_count | streak_days | night_work | perfectionist | color_palette_picks | material_picks
  requirement_value INTEGER     NOT NULL DEFAULT 1,
  is_secret         BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements (category);
CREATE INDEX IF NOT EXISTS achievements_sort_idx     ON public.achievements (sort_order);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "achievements_read_all" ON public.achievements;
CREATE POLICY "achievements_read_all"
  ON public.achievements FOR SELECT
  USING (TRUE);

-- ── 2. user_achievements (unlocks) ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID        NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen           BOOLEAN     NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_idx   ON public.user_achievements (user_id);
CREATE INDEX IF NOT EXISTS user_achievements_unseen_idx ON public.user_achievements (user_id, seen) WHERE seen = FALSE;

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
CREATE POLICY "user_achievements_select_own"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_update_own" ON public.user_achievements;
CREATE POLICY "user_achievements_update_own"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- INSERTS go through service role (service-role client in the API layer)

-- ── 3. profiles: streak + last-active tracking ───────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_active_date DATE,
  ADD COLUMN IF NOT EXISTS current_streak   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak   INTEGER NOT NULL DEFAULT 0;

-- ── 4. Seed data ─────────────────────────────────────────────────────────────

INSERT INTO public.achievements (key, name, description, icon, category, points, requirement_type, requirement_value, is_secret, sort_order) VALUES
  -- Erste Schritte
  ('welcome',           'Willkommen',          'Account erfolgreich erstellt.',                           'Sparkles',  'erste_schritte', 10,  'account_created',    1, FALSE, 10),
  ('first_project',     'Erstes Projekt',      'Dein allererstes Projekt angelegt.',                     'Rocket',    'erste_schritte', 20,  'project_count',      1, FALSE, 20),
  ('first_room',        'Erster Raum',         'Ersten Raum zu einem Projekt hinzugefügt.',              'DoorOpen',  'erste_schritte', 20,  'room_count',         1, FALSE, 30),

  -- Design-Profi
  ('color_expert',      'Farbexperte',         'Fünf Farbvorlieben in deinen Modul-1-Analysen gepflegt.','Palette',   'design',         40,  'color_palette_picks',5, FALSE, 40),
  ('material_master',   'Material-Meister',    'Fünf Materialien in deinen Analysen berücksichtigt.',    'Layers',    'design',         40,  'material_picks',     5, FALSE, 50),

  -- Visuell
  ('moodboard_creator', 'Moodboard-Creator',   'Erstes Moodboard-Bild hochgeladen.',                     'Images',    'visuell',        30,  'moodboard_urls',     1, FALSE, 60),
  ('before_after',      'Before & After',      'Vorher- und Nachher-Foto eines Raums hinterlegt.',       'Camera',    'visuell',        40,  'before_after',       1, FALSE, 70),
  ('ai_artist',         'KI-Artist',           'Dein erstes KI-Rendering erzeugt.',                      'Wand',      'visuell',        50,  'render_count',       1, FALSE, 80),

  -- Meisterklasse
  ('project_complete',  'Projektabschluss',    'Modul 1 vollständig durchlaufen.',                       'Award',     'meisterklasse',  75,  'module1_complete',   1, FALSE, 90),
  ('five_rooms',        '5 Räume',             'Fünf Räume analysiert.',                                 'Home',      'meisterklasse',  60,  'room_count',         5, FALSE, 100),
  ('ten_rooms',         '10 Räume',            'Zehn Räume analysiert – wahrer Raum-Enthusiast.',        'Building',  'meisterklasse', 120,  'room_count',        10, FALSE, 110),

  -- Engagement
  ('feedback_giver',    'Feedback-Geber',      'Feedback zur App geschickt – danke dafür!',              'MessageSquareHeart', 'engagement', 20, 'feedback_count', 1, FALSE, 120),
  ('streak_7',          '7-Tage-Streak',       'Sieben Tage in Folge aktiv gewesen.',                    'Flame',     'engagement',     50,  'streak_days',        7, FALSE, 130),
  ('streak_30',         '30-Tage-Streak',      'Dreißig Tage am Stück dabei – Dranbleiben!',             'Flame',     'engagement',    150,  'streak_days',       30, FALSE, 140),

  -- Geheim
  ('night_owl',         'Nachtarbeiter',       'Zwischen 2 und 4 Uhr am Projekt gearbeitet.',            'Moon',      'geheim',         30,  'night_work',         1, TRUE,  200),
  ('perfectionist',     'Perfektionist',       'Alle Notizfelder in einer Modul-1-Analyse ausgefüllt.',  'CheckCheck','geheim',         40,  'perfectionist',      1, TRUE,  210)
ON CONFLICT (key) DO NOTHING;

-- ── 5. Verification ──────────────────────────────────────────────────────────
-- SELECT category, COUNT(*) FROM public.achievements GROUP BY category ORDER BY category;
