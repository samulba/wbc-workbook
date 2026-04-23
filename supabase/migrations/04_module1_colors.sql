-- =============================================================
-- Module 1 – Steps 5 & 6: Farbwelt + Materialien
-- =============================================================

ALTER TABLE public.module1_analysis
  ADD COLUMN IF NOT EXISTS primary_colors   TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS secondary_colors TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accent_color     TEXT,
  ADD COLUMN IF NOT EXISTS materials        TEXT[] NOT NULL DEFAULT '{}';
