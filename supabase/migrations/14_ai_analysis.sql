-- KI-Raumanalyse: analysis result stored on room, rate limit on profile

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS ai_analysis    TEXT,
  ADD COLUMN IF NOT EXISTS ai_analysis_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_analysis_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS analysis_reset_date  DATE;
