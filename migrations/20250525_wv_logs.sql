CREATE TABLE uv_logs(
    log_id serial PRIMARY KEY,
    level integer NOT NULL,
    message text NOT NULL,
    session_id varchar(40),
    api_name varchar(128),
    track_id varchar(40),
    data_source varchar(40),
    user_name varchar(128),
    hostname varchar(128),
    pid varchar(40),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX uv_logs_n1 ON uv_logs(track_id);
CREATE INDEX uv_logs_n2 ON uv_logs(data_source);
CREATE INDEX uv_logs_n3 ON uv_logs(session_id);
CREATE INDEX uv_logs_n4 ON uv_logs(user_name);
CREATE INDEX uv_logs_n5 ON uv_logs(created_at);
