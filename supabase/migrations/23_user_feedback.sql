-- Migration: user_feedback table
-- Run manually in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  type           TEXT        NOT NULL CHECK (type IN ('Bug', 'Vorschlag', 'Lob', 'Frage')),
  message        TEXT        NOT NULL,
  page_url       TEXT,
  rating         INTEGER     CHECK (rating BETWEEN 1 AND 5),
  status         TEXT        NOT NULL DEFAULT 'neu'
                             CHECK (status IN ('neu', 'gelesen', 'erledigt')),
  admin_response TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can submit feedback
CREATE POLICY "feedback_insert_own" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "feedback_read_own" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id    ON public.user_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status     ON public.user_feedback (status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type       ON public.user_feedback (type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback (created_at DESC);
