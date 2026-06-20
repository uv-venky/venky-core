CREATE TABLE uv_ttl_store (
    key varchar(128) PRIMARY KEY,
    data jsonb NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX uv_ttl_store_n1 ON uv_ttl_store(expires_at);
