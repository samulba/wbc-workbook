-- ── Add is_active to profiles ────────────────────────────────────────────────
-- Allows admins to deactivate accounts without deleting them.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Index for quick filtering of inactive users
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON public.profiles (is_active);
