-- Add metadata column to uv_user_sessions table
ALTER TABLE uv_user_sessions ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Add metadata column to uv_user_sessions_arch table
ALTER TABLE uv_user_sessions_arch ADD COLUMN IF NOT EXISTS metadata jsonb;
