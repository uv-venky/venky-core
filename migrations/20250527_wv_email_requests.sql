-- Migration: 20250527_uv_email_requests.sql

CREATE TABLE uv_email_requests (
    request_id serial PRIMARY KEY,
    to_address varchar(255),
    subject varchar(255),
    mail_options jsonb NOT NULL,
    attempt_count integer NOT NULL DEFAULT 0,
    last_error text,
    next_attempt_at timestamptz NOT NULL DEFAULT now(),
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX uv_email_requests_n1 ON uv_email_requests(sent_at);
CREATE INDEX uv_email_requests_n2 ON uv_email_requests(next_attempt_at);
