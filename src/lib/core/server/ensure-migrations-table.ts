import { PREFIX } from '@/lib/server/constants';
import type { PgPoolClient } from './db';

function getPgSearchPath(): string {
  return process.env.VENKY_PG_SEARCH_PATH ?? 'core,public';
}

/** Ensures `core` schema, session search_path, and the migrations ledger table exist. */
export async function ensureMigrationsTable(client: PgPoolClient): Promise<void> {
  await client.query('CREATE SCHEMA IF NOT EXISTS core');
  await client.query(`SET search_path TO ${getPgSearchPath()}`);
  await client.query(`CREATE TABLE IF NOT EXISTS ${PREFIX}migrations
  (
      version bigint NOT NULL,
      name character varying(120) NOT NULL,
      installed_on timestamp with time zone NOT NULL DEFAULT now(),
      success boolean NOT NULL,
      checksum text NOT NULL,
      execution_time bigint NOT NULL,
      CONSTRAINT ${PREFIX}migrations_pk PRIMARY KEY (version, name)
  )`);
}
