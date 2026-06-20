-- Support rotating session ids on mobile refresh so a stolen session token
-- can be detected via reuse (old token presented after rotation).

ALTER TABLE uv_user_sessions
  ADD COLUMN IF NOT EXISTS parent_session_id varchar(128),
  ADD COLUMN IF NOT EXISTS rotated_to_session_id varchar(128);

CREATE INDEX IF NOT EXISTS uv_user_sessions_parent_idx
  ON uv_user_sessions(parent_session_id);
