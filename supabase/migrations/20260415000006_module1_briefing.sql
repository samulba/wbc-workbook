-- =============================================================
-- Module 1 – Step 8: Raum-Briefing (Licht + Besondere Elemente)
-- =============================================================

ALTER TABLE public.module1_analysis
  ADD COLUMN IF NOT EXISTS light_mood       TEXT,
  ADD COLUMN IF NOT EXISTS special_elements TEXT;
