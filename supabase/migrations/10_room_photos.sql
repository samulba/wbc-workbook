-- =============================================================
-- Before/After Photos – add columns to rooms table
-- =============================================================

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS before_image_url TEXT,
  ADD COLUMN IF NOT EXISTS after_image_url  TEXT;
