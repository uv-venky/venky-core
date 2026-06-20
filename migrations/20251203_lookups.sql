CREATE TABLE IF NOT EXISTS uv_lookup_types (
    id uuid PRIMARY KEY,
    app_id varchar(40) NOT NULL,
    code varchar(40) NOT NULL,
    name varchar(256) NOT NULL,
    description text,
    value_type varchar(10) NOT NULL DEFAULT 'string',
    created_at timestamptz NOT NULL,
    created_by varchar(128) NOT NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL
);

CREATE UNIQUE INDEX uv_lookup_types_u1 ON uv_lookup_types(app_id, code);

CREATE TABLE IF NOT EXISTS uv_lookup_values (
    id uuid PRIMARY KEY,
    lookup_type_id uuid NOT NULL,
    value varchar(60) NOT NULL,
    label varchar(256),
    description text,
    display_order integer,
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb,
    created_at timestamptz NOT NULL,
    created_by varchar(128) NOT NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL
);

CREATE INDEX uv_lookup_values_n1 ON uv_lookup_values(lookup_type_id);
CREATE UNIQUE INDEX uv_lookup_values_u1 ON uv_lookup_values(lookup_type_id, value);
