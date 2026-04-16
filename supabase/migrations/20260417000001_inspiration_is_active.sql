-- ── Add is_active to inspiration_images ──────────────────────────────────────

ALTER TABLE public.inspiration_images
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_inspiration_is_active ON public.inspiration_images (is_active);

-- Optional: update public read policy to only expose active images to users
-- (Admin always sees all via service-role client)
DROP POLICY IF EXISTS "inspiration_images_public_read" ON public.inspiration_images;

CREATE POLICY "inspiration_images_public_read"
  ON public.inspiration_images FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);
