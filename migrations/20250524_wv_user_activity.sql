CREATE TABLE uv_user_activity(
    activity_id serial PRIMARY KEY,
    user_name varchar(128) NOT NULL,
    event_type varchar(40) NOT NULL,
    description text,
    metadata jsonb,
    page_url varchar(64),
    data_source varchar(40),
    elapsed_time_ms integer,
    session_id varchar(40),
    row_count integer,
    api_name varchar(64),
    track_id varchar(40),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX uv_user_activity_n1 ON uv_user_activity(user_name);
CREATE INDEX uv_user_activity_n2 ON uv_user_activity(created_at);
CREATE INDEX uv_user_activity_n3 ON uv_user_activity(page_url);
CREATE INDEX uv_user_activity_n4 ON uv_user_activity(data_source);
CREATE INDEX uv_user_activity_n5 ON uv_user_activity(api_name);
CREATE INDEX uv_user_activity_n6 ON uv_user_activity(session_id);
CREATE INDEX uv_user_activity_n7 ON uv_user_activity(event_type);
CREATE INDEX uv_user_activity_n8 ON uv_user_activity(track_id);
