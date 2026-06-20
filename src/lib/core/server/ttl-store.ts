'use server';

import type { PgPoolClient } from '@/lib/core/server/db';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';

export async function putTTLValue<T>(client: PgPoolClient, key: string, value: T, ttlSeconds: number): Promise<void> {
  if (key.length > 128) {
    throw new Error('Key must be less than or equal to 128 characters');
  }
  if (ttlSeconds <= 0) {
    throw new Error('TTL must be greater than 0');
  }

  const appId = getConfig('putTTLValue').appId;
  await client.query(
    `INSERT INTO ${PREFIX}ttl_store(key, data, expires_at, app_id)
           VALUES ($1, $2::jsonb, now() + ($3::int) * interval '1 second', $4)
           ON CONFLICT (key)
           DO UPDATE SET data = EXCLUDED.data,
                         expires_at = EXCLUDED.expires_at,
                         created_at = statement_timestamp()`,
    [key, JSON.stringify(value), ttlSeconds, appId],
  );
}

export async function getTTLValue<T = unknown>(client: PgPoolClient, key: string): Promise<T | null> {
  const appId = getConfig('getTTLValue').appId;
  const { rows } = await client.query<{ data: T }>(
    `SELECT data FROM ${PREFIX}ttl_store WHERE key = $1 AND expires_at > now() AND app_id = $2`,
    [key, appId],
  );
  return rows[0]?.data ?? null;
}

export async function consumeTTLValue<T = unknown>(client: PgPoolClient, key: string): Promise<T | null> {
  const appId = getConfig('consumeTTLValue').appId;
  const { rows } = await client.query<{ data: T }>(
    `DELETE FROM ${PREFIX}ttl_store
      WHERE key = $1
        AND expires_at > now()
        AND app_id = $2
      RETURNING data`,
    [key, appId],
  );
  return rows[0]?.data ?? null;
}

export async function deleteTTLValue(client: PgPoolClient, key: string): Promise<void> {
  const appId = getConfig('deleteTTLValue').appId;
  await client.query(`DELETE FROM ${PREFIX}ttl_store WHERE key = $1 AND app_id = $2`, [key, appId]);
}
