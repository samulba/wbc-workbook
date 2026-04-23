-- ============================================================================
-- One-time rename of already-applied migration entries
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL editor AFTER pulling the renamed migration
-- files. It updates supabase_migrations.schema_migrations so the new sequential
-- numbers (00, 01, ...) are registered as "already applied". Without this,
-- `supabase db push` would re-run every renamed migration and fail because
-- tables/types already exist.
--
-- Safe to run multiple times (idempotent via WHERE clauses).
-- ============================================================================

BEGIN;

UPDATE supabase_migrations.schema_migrations SET version = '00' WHERE version = '20260415000001';
UPDATE supabase_migrations.schema_migrations SET version = '01' WHERE version = '20260415000002';
UPDATE supabase_migrations.schema_migrations SET version = '02' WHERE version = '20260415000003';
UPDATE supabase_migrations.schema_migrations SET version = '03' WHERE version = '20260415000004';
UPDATE supabase_migrations.schema_migrations SET version = '04' WHERE version = '20260415000005';
UPDATE supabase_migrations.schema_migrations SET version = '05' WHERE version = '20260415000006';
UPDATE supabase_migrations.schema_migrations SET version = '06' WHERE version = '20260415000007';
UPDATE supabase_migrations.schema_migrations SET version = '07' WHERE version = '20260415000008';
UPDATE supabase_migrations.schema_migrations SET version = '08' WHERE version = '20260416000001';
UPDATE supabase_migrations.schema_migrations SET version = '09' WHERE version = '20260416000003';
UPDATE supabase_migrations.schema_migrations SET version = '10' WHERE version = '20260416000004';
UPDATE supabase_migrations.schema_migrations SET version = '11' WHERE version = '20260416000005';
UPDATE supabase_migrations.schema_migrations SET version = '12' WHERE version = '20260416000006';
UPDATE supabase_migrations.schema_migrations SET version = '13' WHERE version = '20260416000007';
UPDATE supabase_migrations.schema_migrations SET version = '14' WHERE version = '20260416000008';
UPDATE supabase_migrations.schema_migrations SET version = '15' WHERE version = '20260416000009';
UPDATE supabase_migrations.schema_migrations SET version = '16' WHERE version = '20260416000010';
UPDATE supabase_migrations.schema_migrations SET version = '17' WHERE version = '20260416000011';
UPDATE supabase_migrations.schema_migrations SET version = '18' WHERE version = '20260416000012';
UPDATE supabase_migrations.schema_migrations SET version = '19' WHERE version = '20260416000013';
UPDATE supabase_migrations.schema_migrations SET version = '20' WHERE version = '20260416000014';
UPDATE supabase_migrations.schema_migrations SET version = '21' WHERE version = '20260416000015';
UPDATE supabase_migrations.schema_migrations SET version = '22' WHERE version = '20260417000001';
UPDATE supabase_migrations.schema_migrations SET version = '23' WHERE version = '20260417000003';
UPDATE supabase_migrations.schema_migrations SET version = '24' WHERE version = '20260417000004';
UPDATE supabase_migrations.schema_migrations SET version = '25' WHERE version = '20260417000005';
UPDATE supabase_migrations.schema_migrations SET version = '26' WHERE version = '20260417000006';
UPDATE supabase_migrations.schema_migrations SET version = '27' WHERE version = '20260417000007';
UPDATE supabase_migrations.schema_migrations SET version = '28' WHERE version = '20260417000008';
UPDATE supabase_migrations.schema_migrations SET version = '29' WHERE version = '20260417000009';
UPDATE supabase_migrations.schema_migrations SET version = '30' WHERE version = '20260418000001';
UPDATE supabase_migrations.schema_migrations SET version = '31' WHERE version = '20260422000001';
UPDATE supabase_migrations.schema_migrations SET version = '32' WHERE version = '20260422000002';
UPDATE supabase_migrations.schema_migrations SET version = '33' WHERE version = '20260422000003';
UPDATE supabase_migrations.schema_migrations SET version = '34' WHERE version = '20260423000001';
UPDATE supabase_migrations.schema_migrations SET version = '35' WHERE version = '20260423000002';

COMMIT;

-- Sanity check — list what's registered now
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
