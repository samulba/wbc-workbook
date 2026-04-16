-- Migration: faqs table
-- Run manually in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.faqs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  category   TEXT        NOT NULL DEFAULT 'Allgemein',
  sort_order INTEGER     NOT NULL DEFAULT 0,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_public_read"
  ON public.faqs FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_faqs_category   ON public.faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON public.faqs (sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active  ON public.faqs (is_active);
