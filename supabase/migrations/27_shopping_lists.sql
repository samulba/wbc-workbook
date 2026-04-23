-- ============================================================================
-- Shopping Lists & Budget Tracker
-- ============================================================================

-- ── Priority enum ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shopping_priority') THEN
    CREATE TYPE public.shopping_priority AS ENUM ('must_have', 'nice_to_have', 'maybe_later');
  END IF;
END$$;

-- ── shopping_lists ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  name         TEXT        NOT NULL,
  budget_total NUMERIC(10,2),
  share_token  TEXT        UNIQUE,
  is_shared    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shopping_lists_user_idx    ON public.shopping_lists (user_id);
CREATE INDEX IF NOT EXISTS shopping_lists_project_idx ON public.shopping_lists (project_id);

CREATE TRIGGER shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shopping_lists_all_own" ON public.shopping_lists;
CREATE POLICY "shopping_lists_all_own"
  ON public.shopping_lists
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── shopping_list_items ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id        UUID        NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id     UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  custom_name    TEXT,
  custom_price   NUMERIC(10,2),
  custom_url     TEXT,
  custom_image   TEXT,
  quantity       INTEGER     NOT NULL DEFAULT 1,
  priority       public.shopping_priority NOT NULL DEFAULT 'nice_to_have',
  is_purchased   BOOLEAN     NOT NULL DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shopping_list_items_list_idx     ON public.shopping_list_items (list_id);
CREATE INDEX IF NOT EXISTS shopping_list_items_priority_idx ON public.shopping_list_items (priority);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS via list ownership (no profiles reference → no recursion risk)
DROP POLICY IF EXISTS "shopping_list_items_all_via_list" ON public.shopping_list_items;
CREATE POLICY "shopping_list_items_all_via_list"
  ON public.shopping_list_items
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM public.shopping_lists WHERE id = list_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.shopping_lists WHERE id = list_id)
  );

-- ── Public RPC for shared lists (anon can call) ──────────────────────────────

CREATE OR REPLACE FUNCTION public.get_shared_shopping_list(p_token TEXT)
RETURNS TABLE (
  list_id        UUID,
  list_name      TEXT,
  project_name   TEXT,
  budget_total   NUMERIC,
  created_at     TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT sl.id, sl.name::TEXT, p.name::TEXT, sl.budget_total, sl.created_at
  FROM   public.shopping_lists sl
  LEFT   JOIN public.projects p ON p.id = sl.project_id
  WHERE  sl.share_token = p_token
    AND  sl.is_shared   = TRUE
  LIMIT  1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_shopping_list(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_shared_shopping_items(p_token TEXT)
RETURNS TABLE (
  id            UUID,
  name          TEXT,
  price         NUMERIC,
  url           TEXT,
  image         TEXT,
  quantity      INTEGER,
  priority      TEXT,
  is_purchased  BOOLEAN,
  notes         TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    i.id,
    COALESCE(i.custom_name, p.name)::TEXT                            AS name,
    COALESCE(i.custom_price, p.price)                                AS price,
    COALESCE(i.custom_url,  p.affiliate_url)::TEXT                   AS url,
    COALESCE(i.custom_image, p.image_url)::TEXT                      AS image,
    i.quantity,
    i.priority::TEXT,
    i.is_purchased,
    i.notes
  FROM   public.shopping_list_items i
  JOIN   public.shopping_lists sl ON sl.id = i.list_id
  LEFT   JOIN public.products  p  ON p.id  = i.product_id
  WHERE  sl.share_token = p_token
    AND  sl.is_shared   = TRUE
  ORDER BY
    CASE i.priority
      WHEN 'must_have'    THEN 0
      WHEN 'nice_to_have' THEN 1
      WHEN 'maybe_later'  THEN 2
    END,
    i.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_shopping_items(TEXT) TO anon, authenticated;
