-- Match uv_user_activity.page_url (widened in 20250719_page_url2.sql); archive was still varchar(64).
ALTER TABLE uv_user_activity_archive
    ALTER COLUMN page_url TYPE character varying(128);
