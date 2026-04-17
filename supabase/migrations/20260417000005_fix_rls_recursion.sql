-- ============================================================================
-- Fix: Infinite Recursion in RLS Policies
-- ============================================================================
-- Problem: Policies on profiles, projects, rooms, module1_analysis
-- referenced `public.profiles` inside their USING/WITH CHECK clauses
-- to determine admin-status. That triggers the same profiles-RLS policies
-- recursively → "infinite recursion detected in policy for relation profiles".
--
-- Fix: Drop ALL existing policies on these 4 tables and recreate with
-- simple, non-recursive policies that only use auth.uid().
-- Admin access is handled in the application layer via the service-role
-- Supabase client (`createAdminClient()`), which bypasses RLS entirely.
-- ============================================================================

-- ── 1. DROP ALL existing policies on the 4 affected tables ──────────────────

DROP POLICY IF EXISTS "profiles: users read own"          ON public.profiles;
DROP POLICY IF EXISTS "profiles: users update own"        ON public.profiles;
DROP POLICY IF EXISTS "profiles: admins read all"         ON public.profiles;

DROP POLICY IF EXISTS "projects: users manage own"        ON public.projects;
DROP POLICY IF EXISTS "projects: admins manage all"       ON public.projects;

DROP POLICY IF EXISTS "rooms: users manage via project"   ON public.rooms;
DROP POLICY IF EXISTS "rooms: admins manage all"          ON public.rooms;

DROP POLICY IF EXISTS "module1: users manage via room"    ON public.module1_analysis;
DROP POLICY IF EXISTS "module1: admins manage all"        ON public.module1_analysis;

-- Safety net: drop any other policies that might have been created manually
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'projects', 'rooms', 'module1_analysis')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END$$;


-- ── 2. RE-ENABLE RLS (should already be on, just to be safe) ────────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module1_analysis ENABLE ROW LEVEL SECURITY;


-- ── 3. profiles — only self-access ──────────────────────────────────────────
-- INSERT is handled by the SECURITY DEFINER trigger `handle_new_user()`,
-- so no INSERT policy is needed here.

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);


-- ── 4. projects — only the owner ────────────────────────────────────────────

CREATE POLICY "projects_all_own"
  ON public.projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 5. rooms — owner via projects (no profiles reference) ───────────────────

CREATE POLICY "rooms_all_via_project"
  ON public.rooms
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );


-- ── 6. module1_analysis — owner via rooms→projects (no profiles reference) ──

CREATE POLICY "module1_all_via_room"
  ON public.module1_analysis
  FOR ALL
  USING (
    auth.uid() = (
      SELECT p.user_id
      FROM public.projects p
      JOIN public.rooms r ON r.project_id = p.id
      WHERE r.id = room_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id
      FROM public.projects p
      JOIN public.rooms r ON r.project_id = p.id
      WHERE r.id = room_id
    )
  );


-- ── 7. Verification query (run manually after the migration) ────────────────
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles', 'projects', 'rooms', 'module1_analysis')
-- ORDER BY tablename, policyname;
