-- ============================================================================
-- "Frag einen Freund" — per-request share-for-feedback links
-- ============================================================================
-- Different from rooms.share_token (which is a single stable link per room):
-- this table holds SHORT-LIVED, per-question tokens. A user can ask multiple
-- friends different questions about the same room.
-- ============================================================================

-- ── share_feedback_links ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.share_feedback_links (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id     UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  question    TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS share_feedback_links_user_idx  ON public.share_feedback_links (user_id);
CREATE INDEX IF NOT EXISTS share_feedback_links_room_idx  ON public.share_feedback_links (room_id);
CREATE INDEX IF NOT EXISTS share_feedback_links_token_idx ON public.share_feedback_links (token);

ALTER TABLE public.share_feedback_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "share_feedback_links_all_own" ON public.share_feedback_links;
CREATE POLICY "share_feedback_links_all_own"
  ON public.share_feedback_links
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── share_feedback_responses ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.share_feedback_responses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id     UUID        NOT NULL REFERENCES public.share_feedback_links(id) ON DELETE CASCADE,
  name        TEXT,
  message     TEXT        NOT NULL,
  rating      INTEGER,                                 -- 1..5, nullable
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT share_feedback_rating_range CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
);

CREATE INDEX IF NOT EXISTS share_feedback_responses_link_idx ON public.share_feedback_responses (link_id);

ALTER TABLE public.share_feedback_responses ENABLE ROW LEVEL SECURITY;

-- Owner can read responses for their own links
DROP POLICY IF EXISTS "share_feedback_responses_select_own" ON public.share_feedback_responses;
CREATE POLICY "share_feedback_responses_select_own"
  ON public.share_feedback_responses
  FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.share_feedback_links WHERE id = link_id)
  );

-- Owner can delete individual responses
DROP POLICY IF EXISTS "share_feedback_responses_delete_own" ON public.share_feedback_responses;
CREATE POLICY "share_feedback_responses_delete_own"
  ON public.share_feedback_responses
  FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM public.share_feedback_links WHERE id = link_id)
  );

-- Public INSERT happens via a SECURITY DEFINER RPC below (not direct insert).

-- ── Public RPC: fetch the room's design data for a still-valid link ─────────
-- Returns only design-relevant fields, no personal info.

CREATE OR REPLACE FUNCTION public.get_feedback_request(p_token TEXT)
RETURNS TABLE (
  question          TEXT,
  asker_name        TEXT,                 -- requester display name (from profile)
  expires_at        TIMESTAMPTZ,
  room_name         TEXT,
  room_type         TEXT,
  main_effect       TEXT,
  primary_colors    TEXT[],
  secondary_colors  TEXT[],
  accent_color      TEXT,
  materials         TEXT[],
  light_mood        TEXT,
  special_elements  TEXT,
  moodboard_urls    TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    l.question::TEXT,
    COALESCE((u.raw_user_meta_data ->> 'full_name'), 'Jemand')::TEXT     AS asker_name,
    l.expires_at,
    r.name::TEXT                                        AS room_name,
    r.room_type::TEXT                                   AS room_type,
    COALESCE(m.main_effect::TEXT, '')                   AS main_effect,
    COALESCE(m.primary_colors,   '{}')                  AS primary_colors,
    COALESCE(m.secondary_colors, '{}')                  AS secondary_colors,
    COALESCE(m.accent_color,     '')                    AS accent_color,
    COALESCE(m.materials,        '{}')                  AS materials,
    COALESCE(m.light_mood,       '')                    AS light_mood,
    COALESCE(m.special_elements, '')                    AS special_elements,
    COALESCE(m.moodboard_urls,   '{}')                  AS moodboard_urls
  FROM   public.share_feedback_links     l
  JOIN   public.rooms                    r ON r.id = l.room_id
  LEFT   JOIN public.module1_analysis    m ON m.room_id = r.id
  LEFT   JOIN auth.users                 u ON u.id = l.user_id
  WHERE  l.token      = p_token
    AND  l.is_active  = TRUE
    AND  l.expires_at > NOW()
  LIMIT  1;
$$;

GRANT EXECUTE ON FUNCTION public.get_feedback_request(TEXT) TO anon, authenticated;

-- ── Public RPC: submit feedback — runs as definer so anon can INSERT ─────────

CREATE OR REPLACE FUNCTION public.submit_feedback_response(
  p_token   TEXT,
  p_name    TEXT,
  p_message TEXT,
  p_rating  INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link_id UUID;
BEGIN
  -- Resolve an active, non-expired link
  SELECT id INTO v_link_id
  FROM   public.share_feedback_links
  WHERE  token       = p_token
    AND  is_active   = TRUE
    AND  expires_at  > NOW()
  LIMIT  1;

  IF v_link_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Validate + normalize
  IF p_message IS NULL OR length(trim(p_message)) = 0 THEN
    RETURN FALSE;
  END IF;
  IF p_rating IS NOT NULL AND (p_rating < 1 OR p_rating > 5) THEN
    p_rating := NULL;
  END IF;

  INSERT INTO public.share_feedback_responses (link_id, name, message, rating)
  VALUES (
    v_link_id,
    NULLIF(trim(p_name), ''),
    substring(trim(p_message) from 1 for 2000),
    p_rating
  );

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_feedback_response(TEXT, TEXT, TEXT, INTEGER) TO anon, authenticated;
