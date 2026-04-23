-- Migration: color_palettes table
-- Run manually in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.color_palettes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  room_effect      TEXT,
  primary_colors   TEXT[]      NOT NULL DEFAULT '{}',
  secondary_colors TEXT[]      NOT NULL DEFAULT '{}',
  accent_color     TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.color_palettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "color_palettes_public_read"
  ON public.color_palettes FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_color_palettes_room_effect ON public.color_palettes (room_effect);
CREATE INDEX IF NOT EXISTS idx_color_palettes_is_active   ON public.color_palettes (is_active);
