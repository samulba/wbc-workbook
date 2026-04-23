-- ─────────────────────────────────────────────────────────────────────────────
-- Bump moodboards bucket size limit 5MB → 15MB.
-- OpenAI gpt-image-1 renders at 1024×1024 medium quality can reach 4-6MB,
-- at high quality up to ~10MB. 15MB gives headroom without being reckless.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE storage.buckets
SET file_size_limit = 15728640            -- 15 MB
WHERE id = 'moodboards';
