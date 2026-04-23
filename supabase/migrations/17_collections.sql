-- ── Collections: user saves curated inspiration images ──────────────────────────

-- user_id on inspiration_images (for user-uploaded content)
ALTER TABLE public.inspiration_images
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Allow authenticated users to upload their own inspiration images
CREATE POLICY IF NOT EXISTS "inspiration_user_insert"
  ON public.inspiration_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "inspiration_user_delete"
  ON public.inspiration_images FOR DELETE
  USING (auth.uid() = user_id);

-- ── inspiration_collections ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inspiration_collections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  cover_url   TEXT,
  item_count  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insp_collections_user ON public.inspiration_collections(user_id);

CREATE TRIGGER inspiration_collections_updated_at
  BEFORE UPDATE ON public.inspiration_collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── collection_items ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.collection_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id   UUID        NOT NULL REFERENCES public.inspiration_collections(id) ON DELETE CASCADE,
  inspiration_id  UUID        REFERENCES public.inspiration_images(id) ON DELETE CASCADE,
  custom_url      TEXT,
  custom_title    TEXT,
  custom_colors   TEXT[]      NOT NULL DEFAULT '{}',
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate entries for the same inspiration in a collection
CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_items_unique
  ON public.collection_items(collection_id, inspiration_id)
  WHERE inspiration_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_collection_items_coll ON public.collection_items(collection_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.inspiration_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collections_own"
  ON public.inspiration_collections FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "collection_items_own"
  ON public.collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspiration_collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspiration_collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- ── item_count trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_collection_item_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE inspiration_collections SET item_count = item_count + 1 WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inspiration_collections SET item_count = GREATEST(item_count - 1, 0) WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER collection_item_count_sync
  AFTER INSERT OR DELETE ON public.collection_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_collection_item_count();
