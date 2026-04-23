-- Extend products table with fields needed for Modul 1 affiliate recommendations
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS partner       TEXT,
  ADD COLUMN IF NOT EXISTS subcategory   TEXT,
  ADD COLUMN IF NOT EXISTS module        SMALLINT CHECK (module BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS style         TEXT,
  ADD COLUMN IF NOT EXISTS material      TEXT,
  ADD COLUMN IF NOT EXISTS color_family  TEXT,
  ADD COLUMN IF NOT EXISTS room_types    TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS why_fits      TEXT,
  ADD COLUMN IF NOT EXISTS priority      INTEGER NOT NULL DEFAULT 0;

-- Allow admins to also read inactive products (override the active-only SELECT policy)
-- The existing "products: admins manage all" FOR ALL policy already covers SELECT,
-- so inactive products are readable by admins via that policy.
-- No additional policy needed.
