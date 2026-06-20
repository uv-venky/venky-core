-- Migration: Add scheduler_id column to job tables for local dev isolation
--
-- In production, scheduler_id = 'production' and all instances process these jobs.
-- In local dev, scheduler_id = hostname, so each dev's scheduler only processes their own jobs.

ALTER TABLE uv_email_requests ADD COLUMN IF NOT EXISTS scheduler_id varchar(128) NOT NULL DEFAULT 'production';
ALTER TABLE uv_job_schedule ADD COLUMN IF NOT EXISTS scheduler_id varchar(128) NOT NULL DEFAULT 'production';

ALTER TABLE uv_job_schedule DROP CONSTRAINT IF EXISTS uv_job_schedule_pkey;
ALTER TABLE uv_job_schedule ADD PRIMARY KEY (app_id, scheduler_id, job_name);

CREATE INDEX IF NOT EXISTS uv_email_requests_scheduler_id_idx ON uv_email_requests(scheduler_id);
