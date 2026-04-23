-- ─────────────────────────────────────────────────────────────────────────────
-- AI usage tracking
-- Every call to /api/analyse-room and /api/render-room logs a row so the
-- admin dashboard can show spend + volume per endpoint / user / day.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint       TEXT NOT NULL,                       -- 'analyse-room' | 'render-room'
  model          TEXT NOT NULL,                       -- 'gpt-4o' | 'gpt-image-1'
  input_tokens   INTEGER NOT NULL DEFAULT 0,
  output_tokens  INTEGER NOT NULL DEFAULT 0,
  image_count    INTEGER NOT NULL DEFAULT 0,
  -- Micro-dollars (1 USD = 1,000,000). Using integer avoids floating point drift.
  cost_micros    BIGINT  NOT NULL DEFAULT 0,
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON public.ai_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id    ON public.ai_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_endpoint   ON public.ai_usage (endpoint);

-- RLS: admins read, service-role writes. Users can't see this table.
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_usage_admin_read ON public.ai_usage;
CREATE POLICY ai_usage_admin_read ON public.ai_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE  public.ai_usage              IS 'One row per OpenAI API call (GPT-4o vision + gpt-image-1). Used for admin cost dashboard.';
COMMENT ON COLUMN public.ai_usage.cost_micros  IS 'Cost in millionths of a USD (1e-6). 42_000 = $0.042.';
COMMENT ON COLUMN public.ai_usage.metadata     IS 'Endpoint-specific detail (room_id, project_id, quality, size, etc).';
