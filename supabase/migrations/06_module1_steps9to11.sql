-- =============================================================
-- Module 1 – Steps 9-11: Moodboard-Prompt & Abschluss
-- =============================================================

ALTER TABLE public.module1_analysis
  ADD COLUMN IF NOT EXISTS moodboard_prompt TEXT,
  ADD COLUMN IF NOT EXISTS status           TEXT DEFAULT 'in_progress';
