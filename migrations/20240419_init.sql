CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

CREATE TABLE uv_users(
    user_name varchar(128) NOT NULL,
    user_id integer,
    email varchar(128) NOT NULL,
    display_name varchar(128) NOT NULL,
    location_name varchar(128),
    picture text,
    created_at timestamptz NOT NULL,
    created_by varchar(128) NOT NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    password_hash varchar(256) NOT NULL,
    api_key varchar(256),
    api_secret varchar(256),
    previous_password_hashes jsonb NOT NULL,
    last_login timestamptz,
    ip_address varchar(128),
    locked boolean NOT NULL,
    failed_login_attempts integer NOT NULL,
    last_failed_login timestamptz,
    last_failed_login_ip_address varchar(128),
    last_password_reset timestamptz,
    last_password_reset_ip_address varchar(128),
    last_password_reset_by varchar(128),
    settings jsonb NOT NULL,
    CONSTRAINT uv_users_pk PRIMARY KEY (user_name)
);

CREATE TABLE uv_user_sessions(
    user_name varchar(128) NOT NULL,
    user_id integer,
    session_id varchar(40) NOT NULL,
    ip_address varchar(128) NOT NULL,
    user_agent text NOT NULL,
    csrf_token varchar(128) NOT NULL,
    expires_at timestamptz NOT NULL,
    signed_in_at timestamptz NOT NULL,
    last_accessed_at timestamptz NOT NULL,
    signed_out_at timestamptz,
    CONSTRAINT uv_user_sessions_pk PRIMARY KEY (session_id)
);

CREATE TABLE uv_user_sessions_arch(
    user_name varchar(128) NOT NULL,
    user_id integer,
    session_id varchar(40) NOT NULL,
    ip_address varchar(128) NOT NULL,
    user_agent text NOT NULL,
    csrf_token varchar(128) NOT NULL,
    expires_at timestamptz NOT NULL,
    signed_in_at timestamptz NOT NULL,
    last_accessed_at timestamptz NOT NULL,
    signed_out_at timestamptz,
    CONSTRAINT uv_user_sessions_arch_pk PRIMARY KEY (session_id)
);

CREATE TABLE uv_roles(
    role_code varchar(128) NOT NULL,
    role_name varchar(128) NOT NULL,
    description text,
    created_at timestamptz NOT NULL,
    created_by varchar(128) NOT NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    CONSTRAINT uv_roles_pk PRIMARY KEY (role_code)
);


INSERT INTO uv_roles(role_code, role_name, description, created_at, created_by, updated_at,
    updated_by, start_date)
    VALUES ('root', 'Super Administrator', 'Super Administrator role', NOW(),
	'system', NOW(), 'system', NOW());

INSERT INTO uv_roles(role_code, role_name, description, created_at, created_by, updated_at,
    updated_by, start_date)
    VALUES ('admin', 'Administrator', 'Administrator role', NOW(),
    'system', NOW(), 'system', NOW());

INSERT INTO uv_roles(role_code, role_name, description, created_at, created_by, updated_at,
    updated_by, start_date)
    VALUES ('user_admin', 'User Administrator', 'User Administrator role', NOW(),
    'system', NOW(), 'system', NOW());

INSERT INTO uv_roles(role_code, role_name, description, created_at, created_by, updated_at,
    updated_by, start_date)
    VALUES ('user', 'User', 'User role', NOW(),
    'system', NOW(), 'system', NOW());

CREATE TABLE uv_user_roles(
    role_code varchar(128) NOT NULL,
    user_name varchar(128) NOT NULL,
    created_at timestamptz NOT NULL,
    created_by varchar(128) NOT NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    CONSTRAINT uv_user_roles_pk PRIMARY KEY (user_name, role_code)
);

INSERT INTO uv_user_roles(role_code, user_name, created_at, created_by, updated_at, updated_by, start_date)
    VALUES ('root', 'admin', NOW(), 'system', NOW(), 'system', NOW());

INSERT INTO uv_user_roles(role_code, user_name, created_at, created_by, updated_at, updated_by, start_date)
    VALUES ('admin', 'admin', NOW(), 'system', NOW(), 'system', NOW());


CREATE TABLE uv_audit
(
    datasource_id varchar(40) NOT NULL,
    pk_value varchar(120) NOT NULL,
    attribute_code varchar(40) NOT NULL,
    value_type varchar(20) NOT NULL,
    old_string_value varchar(512) default NULL,
    new_string_value varchar(512) default NULL,
    old_clob_value text,
    new_clob_value text,
    old_double_value double precision,
    new_double_value double precision,
    old_datetime_value timestamptz default NULL,
    new_datetime_value timestamptz default NULL,
    updated_at timestamptz NOT NULL,
    updated_by varchar(128) NOT NULL,
    audit_id serial,
    primary key (audit_id)
);

CREATE TABLE uv_saved_search
(
    id character varying(40) NOT NULL,
    page_id character varying(40) NOT NULL,
    item_id character varying(40) NOT NULL,
    owner character varying(128) NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    is_public boolean NOT NULL,
    is_default boolean NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL,
    created_by character varying(128) NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    updated_by character varying(128) NOT NULL,
    CONSTRAINT uv_saved_search_pk PRIMARY KEY (id)
);