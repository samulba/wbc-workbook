-- ── Coaching Bookings ────────────────────────────────────────────────────────

CREATE TABLE public.coaching_bookings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id      UUID        REFERENCES public.rooms(id) ON DELETE SET NULL,
  booking_date DATE        NOT NULL,
  booking_time TEXT        NOT NULL,
  duration     INTEGER     NOT NULL DEFAULT 30,
  status       TEXT        NOT NULL DEFAULT 'pending',
  notes        TEXT,
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT coaching_bookings_status_check
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

CREATE INDEX coaching_bookings_user_id_idx    ON public.coaching_bookings (user_id);
CREATE INDEX coaching_bookings_date_idx       ON public.coaching_bookings (booking_date);
CREATE INDEX coaching_bookings_status_idx     ON public.coaching_bookings (status);

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER coaching_bookings_updated_at
  BEFORE UPDATE ON public.coaching_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.coaching_bookings ENABLE ROW LEVEL SECURITY;

-- Users see & manage their own bookings
CREATE POLICY "coaching_user_select" ON public.coaching_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "coaching_user_insert" ON public.coaching_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coaching_user_update" ON public.coaching_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins see & manage all bookings
CREATE POLICY "coaching_admin_all" ON public.coaching_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
