-- Create apps table
CREATE TABLE IF NOT EXISTS uv_apps (
    app_id character varying(40) NOT NULL,
    name character varying(128) NOT NULL,
    full_url character varying(256) NOT NULL,
    status_token character varying(256),
    icon character varying(30),
    created_at timestamptz NOT NULL,
    created_by varchar(128) NOT NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL,
    CONSTRAINT uv_apps_pk PRIMARY KEY (app_id)
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS uv_apps_app_id_idx ON uv_apps(app_id);
CREATE UNIQUE INDEX IF NOT EXISTS uv_apps_name_idx ON uv_apps(name);

