-- =============================================================
-- Wellbeing Workbook – Initial Schema
-- =============================================================

-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================
-- ENUMS
-- =============================================================
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'internal',
  'customer'
);

CREATE TYPE public.project_status AS ENUM (
  'entwurf',
  'aktiv',
  'abgeschlossen',
  'archiviert'
);

CREATE TYPE public.room_type AS ENUM (
  'wohnzimmer',
  'schlafzimmer',
  'arbeitszimmer',
  'kinderzimmer',
  'badezimmer',
  'kueche',
  'esszimmer',
  'flur',
  'keller',
  'buero',
  'sonstiges'
);

CREATE TYPE public.room_effect AS ENUM (
  'ruhe_erholung',
  'fokus_konzentration',
  'energie_aktivitaet',
  'kreativitaet_inspiration',
  'begegnung_austausch'
);

CREATE TYPE public.upload_type AS ENUM (
  'image',
  'pdf',
  'document',
  'other'
);


-- =============================================================
-- HELPER: updated_at trigger function
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- =============================================================
-- TABLE: profiles
-- =============================================================
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.user_role NOT NULL DEFAULT 'customer',
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- TABLE: projects
-- =============================================================
CREATE TABLE public.projects (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  description TEXT,
  status      public.project_status NOT NULL DEFAULT 'entwurf',
  budget      NUMERIC(10,2),
  deadline    DATE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX projects_user_id_idx ON public.projects(user_id);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: rooms
-- =============================================================
CREATE TABLE public.rooms (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID          NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  room_type   public.room_type NOT NULL DEFAULT 'wohnzimmer',
  size_sqm    NUMERIC(6,2),
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX rooms_project_id_idx ON public.rooms(project_id);

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: module1_analysis  (1:1 per room)
-- =============================================================
CREATE TABLE public.module1_analysis (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id             UUID        NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,

  -- Raumwirkung
  desired_effects     public.room_effect[] NOT NULL DEFAULT '{}',
  current_situation   TEXT,

  -- Farbwelt
  color_preferences   TEXT[]      NOT NULL DEFAULT '{}',
  color_avoid         TEXT[]      NOT NULL DEFAULT '{}',
  color_notes         TEXT,

  -- Materialien
  material_preferences TEXT[]     NOT NULL DEFAULT '{}',
  material_avoid      TEXT[]      NOT NULL DEFAULT '{}',
  material_notes      TEXT,

  -- Moodboard
  moodboard_urls      TEXT[]      NOT NULL DEFAULT '{}',
  moodboard_notes     TEXT,

  -- Allgemein
  notes               TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER module1_analysis_updated_at
  BEFORE UPDATE ON public.module1_analysis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create module1 record when a room is created
CREATE OR REPLACE FUNCTION public.handle_new_room()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.module1_analysis (room_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_room_created
  AFTER INSERT ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_room();


-- =============================================================
-- TABLE: products  (affiliate catalogue – managed by admins)
-- =============================================================
CREATE TABLE public.products (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  description   TEXT,
  affiliate_url TEXT        NOT NULL,
  image_url     TEXT,
  price         NUMERIC(10,2),
  category      TEXT,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_is_active_idx ON public.products(is_active);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================
-- TABLE: favorites
-- =============================================================
CREATE TABLE public.favorites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  room_id     UUID        REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);


-- =============================================================
-- TABLE: uploads
-- =============================================================
CREATE TABLE public.uploads (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id    UUID          REFERENCES public.projects(id) ON DELETE CASCADE,
  room_id       UUID          REFERENCES public.rooms(id) ON DELETE SET NULL,
  module1_id    UUID          REFERENCES public.module1_analysis(id) ON DELETE SET NULL,
  upload_type   public.upload_type NOT NULL DEFAULT 'image',
  storage_path  TEXT          NOT NULL,
  file_name     TEXT          NOT NULL,
  file_size     INTEGER,
  mime_type     TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX uploads_user_id_idx    ON public.uploads(user_id);
CREATE INDEX uploads_project_id_idx ON public.uploads(project_id);
CREATE INDEX uploads_room_id_idx    ON public.uploads(room_id);


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module1_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads          ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────
CREATE POLICY "profiles: users read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: users update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: admins read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── projects ──────────────────────────────────────────────────
CREATE POLICY "projects: users manage own"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: admins manage all"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal')
    )
  );

-- ── rooms ─────────────────────────────────────────────────────
CREATE POLICY "rooms: users manage via project"
  ON public.rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects pr
      WHERE pr.id = project_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects pr
      WHERE pr.id = project_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms: admins manage all"
  ON public.rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal')
    )
  );

-- ── module1_analysis ──────────────────────────────────────────
CREATE POLICY "module1: users manage via room"
  ON public.module1_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.rooms r
      JOIN public.projects pr ON pr.id = r.project_id
      WHERE r.id = room_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "module1: admins manage all"
  ON public.module1_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal')
    )
  );

-- ── products ──────────────────────────────────────────────────
CREATE POLICY "products: everyone reads active"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "products: admins manage all"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── favorites ─────────────────────────────────────────────────
CREATE POLICY "favorites: users manage own"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── uploads ───────────────────────────────────────────────────
CREATE POLICY "uploads: users manage own"
  ON public.uploads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "uploads: admins manage all"
  ON public.uploads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'internal')
    )
  );
