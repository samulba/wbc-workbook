-- Migration: error_logs table
-- Run manually in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.error_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type  TEXT        NOT NULL DEFAULT 'client',
  message     TEXT        NOT NULL,
  stack_trace TEXT,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  url         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- No public read. Admin reads via service role.
-- No public insert policy; API route uses service role.

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs (error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id    ON public.error_logs (user_id);
