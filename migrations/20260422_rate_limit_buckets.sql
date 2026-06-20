-- Postgres-backed rate-limit buckets shared across all app instances.
-- UNLOGGED so buckets aren't durable (reset on DB crash restart is fine) and
-- writes skip the WAL — cheaper than a normal table for this pattern.

CREATE UNLOGGED TABLE IF NOT EXISTS uv_rate_limit_buckets (
  bucket_key    varchar(256) PRIMARY KEY,
  window_start  timestamptz  NOT NULL,
  request_count integer      NOT NULL DEFAULT 0,
  updated_at    timestamptz  NOT NULL DEFAULT NOW()
);

-- Helper index for periodic cleanup of stale buckets.
CREATE INDEX IF NOT EXISTS uv_rate_limit_buckets_updated_at_idx
  ON uv_rate_limit_buckets(updated_at);
