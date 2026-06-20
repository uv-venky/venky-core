-- Adds nullable domain_id to uv_user_activity for domain-scoped audit rows.
-- Non-domain activity leaves it null.

ALTER TABLE uv_user_activity
  ADD COLUMN IF NOT EXISTS domain_id uuid;

CREATE INDEX IF NOT EXISTS uv_user_activity_domain_id_idx ON uv_user_activity (domain_id);
