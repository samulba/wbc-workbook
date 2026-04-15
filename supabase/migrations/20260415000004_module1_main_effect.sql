-- =============================================================
-- Module 1 – Step 4: Hauptwirkung (single primary room effect)
-- =============================================================

ALTER TABLE public.module1_analysis
  ADD COLUMN IF NOT EXISTS main_effect public.room_effect;
