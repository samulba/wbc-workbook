-- ============================================================================
-- Module 1 — rich fields for the visual redesign of Steps 7–11
-- ============================================================================

ALTER TABLE public.module1_analysis
  -- Step 7 (Licht) — optional custom slider values alongside the preset key
  ADD COLUMN IF NOT EXISTS light_warmth      INTEGER,                    -- 0 (kalt) .. 100 (warm)
  ADD COLUMN IF NOT EXISTS light_brightness  INTEGER,                    -- 0 (gedimmt) .. 100 (hell)

  -- Step 8 — multi-select idea tags next to the free-form text
  ADD COLUMN IF NOT EXISTS special_tags      TEXT[] NOT NULL DEFAULT '{}',

  -- Step 10 — drag-and-drop moodboard canvas layout (items with positions)
  --   JSON shape (per item):
  --   { id: uuid, type: "image"|"color"|"note",
  --     x, y, w, h: number,  z: number,
  --     src?: string, color?: string, text?: string,
  --     frame?: "none"|"white"|"polaroid" }
  ADD COLUMN IF NOT EXISTS moodboard_canvas  JSONB  NOT NULL DEFAULT '[]'::jsonb;

-- Range constraints for the two slider fields (safe against bad client data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'm1_light_warmth_range'
  ) THEN
    ALTER TABLE public.module1_analysis
      ADD CONSTRAINT m1_light_warmth_range
      CHECK (light_warmth IS NULL OR (light_warmth BETWEEN 0 AND 100));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'm1_light_brightness_range'
  ) THEN
    ALTER TABLE public.module1_analysis
      ADD CONSTRAINT m1_light_brightness_range
      CHECK (light_brightness IS NULL OR (light_brightness BETWEEN 0 AND 100));
  END IF;
END$$;
