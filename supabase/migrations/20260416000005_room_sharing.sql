-- =============================================================
-- Room Sharing – share_token + is_shared columns + public RPC
-- =============================================================

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_shared   BOOLEAN NOT NULL DEFAULT false;

-- ── Public RPC: returns safe read-only fields for a shared room ─────────────
-- SECURITY DEFINER bypasses RLS and runs as the function owner (super-user).
-- The WHERE clause guarantees only is_shared=true rows are returned.
-- Granted to anon so unauthenticated visitors can call it.
CREATE OR REPLACE FUNCTION public.get_shared_room(p_token TEXT)
RETURNS TABLE (
  room_name        TEXT,
  room_type        TEXT,
  project_name     TEXT,
  created_at       TIMESTAMPTZ,
  main_effect      TEXT,
  primary_colors   TEXT[],
  secondary_colors TEXT[],
  accent_color     TEXT,
  materials        TEXT[],
  light_mood       TEXT,
  special_elements TEXT,
  moodboard_urls   TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    r.name::TEXT,
    r.room_type::TEXT,
    p.name::TEXT,
    p.created_at,
    m1.main_effect::TEXT,
    COALESCE(m1.primary_colors,   '{}'),
    COALESCE(m1.secondary_colors, '{}'),
    COALESCE(m1.accent_color,     ''),
    COALESCE(m1.materials,        '{}'),
    COALESCE(m1.light_mood,       ''),
    COALESCE(m1.special_elements, ''),
    COALESCE(m1.moodboard_urls,   '{}')
  FROM  public.rooms r
  JOIN  public.projects         p  ON p.id  = r.project_id
  LEFT  JOIN public.module1_analysis m1 ON m1.room_id = r.id
  WHERE r.share_token = p_token
    AND r.is_shared   = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_room(TEXT) TO anon, authenticated;
