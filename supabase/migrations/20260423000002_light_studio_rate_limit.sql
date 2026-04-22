-- ============================================================================
-- Light Temperature Studio — per-user daily rate limit counter
-- Separate from daily_render_count so Module-3 renders don't compete with
-- Module-1 / Module-2 visualisations.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_light_studio_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS light_studio_reset_date  DATE;
