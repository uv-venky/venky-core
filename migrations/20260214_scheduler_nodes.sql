-- Migration: Add uv_scheduler_nodes table for heartbeat-based scheduler tracking
--
-- Each scheduler instance (dev or production) registers itself and sends periodic
-- heartbeats so the Job Command Center can display active nodes, their health,
-- and job execution stats.
--
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS uv_scheduler_nodes (
  app_id         VARCHAR(32)   NOT NULL,
  node_id        VARCHAR(128)  NOT NULL,
  scheduler_id   VARCHAR(64)   NOT NULL,
  pid            INTEGER       NOT NULL,
  started_at     TIMESTAMPTZ   NOT NULL,
  last_seen_at   TIMESTAMPTZ   NOT NULL,
  os_platform    VARCHAR(32),
  node_version   VARCHAR(32),
  cpu_usage      REAL,
  memory_mb      INTEGER,
  jobs_scheduled INTEGER       NOT NULL DEFAULT 0,
  jobs_running   INTEGER       NOT NULL DEFAULT 0,
  jobs_executed  INTEGER       NOT NULL DEFAULT 0,
  PRIMARY KEY (app_id, node_id, pid)
);
