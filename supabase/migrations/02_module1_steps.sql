-- =============================================================
-- Module 1 – Step fields for Schritt 1 & 2
-- =============================================================

ALTER TABLE public.module1_analysis
  -- Schritt 1: Projekt-Steckbrief
  ADD COLUMN IF NOT EXISTS wishes            TEXT[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS support_friends   BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS support_external  BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS support_person    TEXT,

  -- Schritt 2: Warum verändern?
  ADD COLUMN IF NOT EXISTS current_issues    TEXT,
  ADD COLUMN IF NOT EXISTS more_of           TEXT,
  ADD COLUMN IF NOT EXISTS less_of           TEXT,
  ADD COLUMN IF NOT EXISTS change_reason     TEXT;
