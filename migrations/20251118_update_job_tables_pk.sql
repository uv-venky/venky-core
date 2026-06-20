ALTER TABLE uv_job_schedule DROP CONSTRAINT uv_job_schedule_pkey;
ALTER TABLE uv_job_schedule ADD PRIMARY KEY (app_id, job_name);

ALTER TABLE uv_job_history DROP CONSTRAINT uv_job_history_pkey;
ALTER TABLE uv_job_history ADD PRIMARY KEY (app_id, job_run_id);
