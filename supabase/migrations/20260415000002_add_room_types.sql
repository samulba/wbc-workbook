-- =============================================================
-- Add missing room_type enum values
-- Run this if you already applied migration 000001.
-- If you haven't run 000001 yet, update it directly instead.
-- =============================================================

ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'yogaraum';
ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'wellness';
ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'studio';
