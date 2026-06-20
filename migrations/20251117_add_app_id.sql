-- Migration: Add app_id column to core tables for multi-application support

ALTER TABLE uv_job_schedule ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_job_history ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_roles ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_user_roles ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_audit ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_saved_search ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_user_activity ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_logs ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_email_requests ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_ttl_store ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';
ALTER TABLE uv_sql_history ADD COLUMN app_id varchar(128) NOT NULL DEFAULT 'core';

CREATE INDEX IF NOT EXISTS uv_job_schedule_app_id_idx ON uv_job_schedule(app_id);
CREATE INDEX IF NOT EXISTS uv_job_history_app_id_idx ON uv_job_history(app_id);
CREATE INDEX IF NOT EXISTS uv_roles_app_id_idx ON uv_roles(app_id);
CREATE INDEX IF NOT EXISTS uv_user_roles_app_id_idx ON uv_user_roles(app_id);
CREATE INDEX IF NOT EXISTS uv_audit_app_id_idx ON uv_audit(app_id);
CREATE INDEX IF NOT EXISTS uv_saved_search_app_id_idx ON uv_saved_search(app_id);
CREATE INDEX IF NOT EXISTS uv_user_activity_app_id_idx ON uv_user_activity(app_id);
CREATE INDEX IF NOT EXISTS uv_logs_app_id_idx ON uv_logs(app_id);
CREATE INDEX IF NOT EXISTS uv_email_requests_app_id_idx ON uv_email_requests(app_id);
CREATE INDEX IF NOT EXISTS uv_ttl_store_app_id_idx ON uv_ttl_store(app_id);
CREATE INDEX IF NOT EXISTS uv_sql_history_app_id_idx ON uv_sql_history(app_id);
