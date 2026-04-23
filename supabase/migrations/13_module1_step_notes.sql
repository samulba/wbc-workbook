-- Add step_notes JSONB column to module1_analysis
-- Format: {"1": "note for step 1", "4": "thoughts on effect", ...}

ALTER TABLE public.module1_analysis
  ADD COLUMN IF NOT EXISTS step_notes JSONB NOT NULL DEFAULT '{}';
