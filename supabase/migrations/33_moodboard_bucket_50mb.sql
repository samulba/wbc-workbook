-- ─────────────────────────────────────────────────────────────────────────────
-- Bump moodboards bucket size limit 15MB → 50MB.
-- Gives plenty of headroom for gpt-image-1 at high quality / larger sizes
-- (1024×1536, 1536×1024) without needing another bump.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE storage.buckets
SET file_size_limit = 52428800            -- 50 MB
WHERE id = 'moodboards';
