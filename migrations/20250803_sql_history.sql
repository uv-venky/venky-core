CREATE TABLE IF NOT EXISTS uv_sql_history (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  name VARCHAR(255),
  created_by VARCHAR(128) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sql_history_user_id ON uv_sql_history(created_by);
CREATE INDEX IF NOT EXISTS idx_sql_history_created_at ON uv_sql_history(created_at DESC);
