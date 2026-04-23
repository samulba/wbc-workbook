-- =============================================================
-- Module 1 – current_step: tracks furthest wizard step reached
-- =============================================================

ALTER TABLE public.module1_analysis
  ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;
