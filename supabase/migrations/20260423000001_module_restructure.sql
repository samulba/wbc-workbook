-- ============================================================================
-- 4-Module Restructure — Sprint 1
-- ----------------------------------------------------------------------------
-- Creates new module2/3/4_analysis and room_capstone tables (1:1 per room),
-- adds ENUMs used by later modules, backfills any existing rooms with empty
-- rows, copies any existing Light data from module1_analysis into the new
-- module3_analysis (non-destructive — M1 columns stay until M3 ships),
-- and introduces room_progress for soft-gating completion state.
--
-- Plan: /root/.claude/plans/ok-jetzt-das-n-chste-quizzical-fern.md
-- ============================================================================


-- =============================================================
-- ENUMS
-- =============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interior_style') THEN
    CREATE TYPE public.interior_style AS ENUM (
      'skandi',
      'japandi',
      'boho',
      'mid_century',
      'industrial',
      'classic',
      'modern',
      'rustic',
      'minimalist',
      'eclectic'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'light_preset') THEN
    CREATE TYPE public.light_preset AS ENUM (
      'kaminfeuer',
      'sonnenaufgang',
      'tageslicht',
      'abendstimmung',
      'custom'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scent_delivery_method') THEN
    CREATE TYPE public.scent_delivery_method AS ENUM (
      'diffuser',
      'kerze',
      'pflanze',
      'raumspray',
      'keine'
    );
  END IF;
END$$;


-- =============================================================
-- TABLE: module2_analysis  (Interior-Guide, 1:1 per room)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.module2_analysis (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,

  -- Step 1: Stil-Tinder
  preferred_styles  public.interior_style[] NOT NULL DEFAULT '{}',
  rejected_styles   public.interior_style[] NOT NULL DEFAULT '{}',
  primary_style     public.interior_style,

  -- Step 2: Farbwelt
  palette_primary    TEXT[] NOT NULL DEFAULT '{}',
  palette_secondary  TEXT[] NOT NULL DEFAULT '{}',
  palette_accent     TEXT,

  -- Step 3: Maße & Grundriss
  width_cm  INTEGER,
  length_cm INTEGER,
  height_cm INTEGER,
  floorplan_svg TEXT,

  -- Step 4: Zonen
  zones JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Step 5: Möbel-Inventar
  furniture_keep   JSONB NOT NULL DEFAULT '[]'::jsonb,
  furniture_remove JSONB NOT NULL DEFAULT '[]'::jsonb,
  furniture_wish   JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Step 6: Möbel-Tinder
  furniture_favorites JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Step 7: Layout-Canvas
  layout_canvas JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Step 8: KI-Render
  render_urls   TEXT[] NOT NULL DEFAULT '{}',
  render_prompt TEXT,

  -- Wizard housekeeping
  current_step INTEGER     NOT NULL DEFAULT 1,
  status       TEXT        NOT NULL DEFAULT 'in_progress',
  step_notes   JSONB       NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER module2_analysis_updated_at
  BEFORE UPDATE ON public.module2_analysis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: module3_analysis  (Licht-Guide, 1:1 per room)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.module3_analysis (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,

  -- Step 1: Lichtsituation heute
  current_fixtures JSONB NOT NULL DEFAULT '[]'::jsonb,
  baseline_photo_url TEXT,

  -- Step 3: Tageslicht-Analyse
  window_orientation TEXT,        -- N/O/S/W or NO/SO/SW/NW
  daytime_usage      TEXT[] NOT NULL DEFAULT '{}',

  -- Step 4/5: Licht-Preset + Light Temperature Studio
  preset           public.light_preset,
  light_mood       TEXT,
  light_warmth     INTEGER,       -- 0 (kalt) .. 100 (warm)
  light_brightness INTEGER,       -- 0 (gedimmt) .. 100 (hell)
  studio_render_urls TEXT[] NOT NULL DEFAULT '{}',

  -- Step 6: Leuchten-Empfehlungen (favorites / saved products)
  lamp_favorites JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Step 7: Licht-Szenarien — timeline per Tageszeit
  scenarios JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Wizard housekeeping
  current_step INTEGER     NOT NULL DEFAULT 1,
  status       TEXT        NOT NULL DEFAULT 'in_progress',
  step_notes   JSONB       NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT m3_light_warmth_range
    CHECK (light_warmth IS NULL OR (light_warmth BETWEEN 0 AND 100)),
  CONSTRAINT m3_light_brightness_range
    CHECK (light_brightness IS NULL OR (light_brightness BETWEEN 0 AND 100))
);

CREATE TRIGGER module3_analysis_updated_at
  BEFORE UPDATE ON public.module3_analysis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: module4_analysis  (Sinnes-Guide, 1:1 per room)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.module4_analysis (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,

  -- Step 2: Akustik
  reverb_level  TEXT,             -- low / medium / high
  acoustic_measures TEXT[] NOT NULL DEFAULT '{}',

  -- Step 3: Duft & Luft
  scent_method       public.scent_delivery_method,
  scent_notes        TEXT,
  plant_suggestions  JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Step 4: Haptik
  preferred_materials TEXT[] NOT NULL DEFAULT '{}',
  rejected_materials  TEXT[] NOT NULL DEFAULT '{}',

  -- Step 5: Ritual-Builder
  rituals JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Wizard housekeeping
  current_step INTEGER     NOT NULL DEFAULT 1,
  status       TEXT        NOT NULL DEFAULT 'in_progress',
  step_notes   JSONB       NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER module4_analysis_updated_at
  BEFORE UPDATE ON public.module4_analysis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: room_capstone  (Moodboard + PDF + Summary, 1:1 per room)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.room_capstone (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,

  moodboard_canvas JSONB      NOT NULL DEFAULT '[]'::jsonb,
  moodboard_urls   TEXT[]     NOT NULL DEFAULT '{}',
  summary_text     TEXT,
  exported_at      TIMESTAMPTZ,
  pdf_url          TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER room_capstone_updated_at
  BEFORE UPDATE ON public.room_capstone
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: room_progress  (soft-gating state, 1:1 per room)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.room_progress (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,

  m1_completed_at TIMESTAMPTZ,
  m2_completed_at TIMESTAMPTZ,
  m3_completed_at TIMESTAMPTZ,
  m4_completed_at TIMESTAMPTZ,
  capstone_completed_at TIMESTAMPTZ,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER room_progress_updated_at
  BEFORE UPDATE ON public.room_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- Extend handle_new_room() — auto-create M2/M3/M4/capstone/progress rows
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_room()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.module1_analysis (room_id) VALUES (NEW.id);
  INSERT INTO public.module2_analysis (room_id) VALUES (NEW.id);
  INSERT INTO public.module3_analysis (room_id) VALUES (NEW.id);
  INSERT INTO public.module4_analysis (room_id) VALUES (NEW.id);
  INSERT INTO public.room_capstone   (room_id) VALUES (NEW.id);
  INSERT INTO public.room_progress   (room_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;


-- =============================================================
-- Backfill existing rooms (idempotent via ON CONFLICT)
-- =============================================================
INSERT INTO public.module2_analysis (room_id)
  SELECT id FROM public.rooms
  ON CONFLICT (room_id) DO NOTHING;

INSERT INTO public.module3_analysis (room_id)
  SELECT id FROM public.rooms
  ON CONFLICT (room_id) DO NOTHING;

INSERT INTO public.module4_analysis (room_id)
  SELECT id FROM public.rooms
  ON CONFLICT (room_id) DO NOTHING;

INSERT INTO public.room_capstone (room_id)
  SELECT id FROM public.rooms
  ON CONFLICT (room_id) DO NOTHING;

INSERT INTO public.room_progress (room_id)
  SELECT id FROM public.rooms
  ON CONFLICT (room_id) DO NOTHING;


-- =============================================================
-- Copy existing Light data from module1_analysis → module3_analysis
-- (non-destructive — M1 columns remain until M3 ships)
-- =============================================================
UPDATE public.module3_analysis m3
SET
  light_mood       = m1.light_mood,
  light_warmth     = m1.light_warmth,
  light_brightness = m1.light_brightness
FROM public.module1_analysis m1
WHERE m3.room_id = m1.room_id
  AND (m1.light_mood IS NOT NULL OR m1.light_warmth IS NOT NULL OR m1.light_brightness IS NOT NULL);


-- =============================================================
-- Seed m1_completed_at from any module1 rows marked 'completed'
-- =============================================================
UPDATE public.room_progress rp
SET m1_completed_at = m1.updated_at
FROM public.module1_analysis m1
WHERE rp.room_id = m1.room_id
  AND m1.status  = 'completed'
  AND rp.m1_completed_at IS NULL;


-- =============================================================
-- RLS
-- =============================================================
ALTER TABLE public.module2_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module3_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module4_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_capstone    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_progress    ENABLE ROW LEVEL SECURITY;


-- Users manage rows of their own rooms (mirrors module1 policy)
CREATE POLICY "module2: users manage via room"
  ON public.module2_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "module3: users manage via room"
  ON public.module3_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "module4: users manage via room"
  ON public.module4_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "capstone: users manage via room"
  ON public.room_capstone FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "progress: users manage via room"
  ON public.room_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  );


-- Admin access mirrors module1 pattern
CREATE POLICY "module2: admins manage all"
  ON public.module2_analysis FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal'))
  );

CREATE POLICY "module3: admins manage all"
  ON public.module3_analysis FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal'))
  );

CREATE POLICY "module4: admins manage all"
  ON public.module4_analysis FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal'))
  );

CREATE POLICY "capstone: admins manage all"
  ON public.room_capstone FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal'))
  );

CREATE POLICY "progress: admins manage all"
  ON public.room_progress FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal'))
  );


-- =============================================================
-- Indexes
-- =============================================================
CREATE INDEX IF NOT EXISTS module2_analysis_room_id_idx ON public.module2_analysis(room_id);
CREATE INDEX IF NOT EXISTS module3_analysis_room_id_idx ON public.module3_analysis(room_id);
CREATE INDEX IF NOT EXISTS module4_analysis_room_id_idx ON public.module4_analysis(room_id);
CREATE INDEX IF NOT EXISTS room_capstone_room_id_idx    ON public.room_capstone(room_id);
CREATE INDEX IF NOT EXISTS room_progress_room_id_idx    ON public.room_progress(room_id);
