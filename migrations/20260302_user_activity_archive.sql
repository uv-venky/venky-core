-- Create archive table for summarized user activity (daily aggregates)
CREATE TABLE uv_user_activity_archive (
    archive_id serial PRIMARY KEY,
    app_id varchar(128) NOT NULL DEFAULT 'cop',
    activity_date date NOT NULL,
    user_name varchar(128) NOT NULL,
    event_type varchar(40) NOT NULL,
    page_url varchar(64),
    activity_count integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure we only have one row per (app, date, user, event type, page URL)
CREATE UNIQUE INDEX uv_user_activity_archive_u1
    ON uv_user_activity_archive(app_id, activity_date, user_name, event_type, page_url);

-- Helpful indexes for querying history
CREATE INDEX uv_user_activity_archive_activity_date_idx
    ON uv_user_activity_archive(activity_date);

CREATE INDEX uv_user_activity_archive_user_name_idx
    ON uv_user_activity_archive(user_name);

CREATE INDEX uv_user_activity_archive_page_url_idx
    ON uv_user_activity_archive(page_url);

CREATE INDEX uv_user_activity_archive_app_id_idx
    ON uv_user_activity_archive(app_id);

