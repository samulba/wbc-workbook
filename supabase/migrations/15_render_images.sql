-- Add rendered_images column to rooms
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS rendered_images TEXT[] NOT NULL DEFAULT '{}';

-- Add render rate-limiting columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_render_count  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS render_reset_date   DATE;
