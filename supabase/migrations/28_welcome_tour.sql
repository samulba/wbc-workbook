-- ============================================================================
-- Welcome Tour flag on profiles
-- ============================================================================
-- `has_seen_tour` tracks whether a user has completed (or explicitly skipped)
-- the onboarding tour. The dashboard client component reads this and
-- auto-starts driver.js when it is false.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_seen_tour BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing users keep the default (false) — the tour will fire on next login.
-- If you want to exempt existing accounts from the tour, run manually:
--   UPDATE public.profiles SET has_seen_tour = TRUE WHERE created_at < NOW();
