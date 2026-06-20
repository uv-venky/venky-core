-- Add app_id column to uv_user_sessions table
ALTER TABLE uv_user_sessions ADD COLUMN IF NOT EXISTS app_id character varying(40) NOT NULL DEFAULT 'core';

-- Add app_id column to uv_user_sessions_arch table
ALTER TABLE uv_user_sessions_arch ADD COLUMN IF NOT EXISTS app_id character varying(40) NOT NULL DEFAULT 'core';

-- Create index on app_id for uv_user_sessions
CREATE INDEX IF NOT EXISTS uv_user_sessions_app_id_idx ON uv_user_sessions(app_id);

-- Create index on app_id for uv_user_sessions_arch
CREATE INDEX IF NOT EXISTS uv_user_sessions_arch_app_id_idx ON uv_user_sessions_arch(app_id);

