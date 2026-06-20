CREATE TABLE uv_job_schedule(
    job_name varchar(64) PRIMARY KEY,
    schedule varchar(64) NOT NULL,
    next_run timestamptz NOT NULL,
    last_run timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE uv_job_history(
    job_run_id serial PRIMARY KEY,
    job_name varchar(64) NOT NULL,
    node varchar(128),
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    success boolean,
    error text
);

CREATE INDEX uv_job_history_n1 ON uv_job_history(job_name);
CREATE INDEX uv_job_history_n2 ON uv_job_history(started_at);
