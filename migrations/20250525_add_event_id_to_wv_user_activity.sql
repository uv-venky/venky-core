ALTER TABLE uv_user_activity
DROP COLUMN description;

ALTER TABLE uv_user_activity
ADD COLUMN event_id varchar(128) NOT NULL DEFAULT 'unknown';

CREATE INDEX uv_user_activity_n9 ON uv_user_activity(event_id); 