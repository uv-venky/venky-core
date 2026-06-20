/* Copyright (c) 2024-present Venky Corp. */

import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';

/**
 * Aggregated audit statistics
 */
export interface AuditStats {
  total: number;
  uniqueEntities: number;
  uniqueUsers: number;
  uniqueDatasources: number;
  latestUpdate: string | null;
  changesByType: {
    added: number;
    removed: number;
    modified: number;
    activated: number;
    deactivated: number;
  };
}

/**
 * Distinct values for smart search Select columns
 */
export interface AuditFilterOptions {
  datasources: string[];
  users: string[];
  attributes: string[];
  valueTypes: string[];
}

/**
 * Query aggregated audit statistics.
 * This fetches stats independently of any filtered data view.
 */
export async function queryAuditStats({ client }: { client: PgPoolClient; session: Session }): Promise<AuditStats> {
  const appId = getConfig('queryAuditStats').appId;

  // Get basic counts
  const countsSql = `
    SELECT 
      COUNT(*) AS total,
      COUNT(DISTINCT datasource_id || '-' || pk_value) AS unique_entities,
      COUNT(DISTINCT updated_by) AS unique_users,
      COUNT(DISTINCT datasource_id) AS unique_datasources,
      MAX(updated_at) AS latest_update
    FROM ${PREFIX}audit
    WHERE app_id = $1
  `;
  const countsResult = await client.query(countsSql, [appId]);
  const counts = countsResult.rows[0];

  // Get change type counts using CASE expressions
  // added: old value is null, new value is not null
  // removed: old value is not null, new value is null
  // activated: attribute_code = 'activeFlag' and new_string_value = 'Y'
  // deactivated: attribute_code = 'activeFlag' and new_string_value = 'N'
  // modified: everything else
  const changeTypesSql = `
    SELECT
      COUNT(*) FILTER (WHERE 
        (old_string_value IS NULL AND old_double_value IS NULL AND old_datetime_value IS NULL AND old_clob_value IS NULL)
        AND (new_string_value IS NOT NULL OR new_double_value IS NOT NULL OR new_datetime_value IS NOT NULL OR new_clob_value IS NOT NULL)
      ) AS added,
      COUNT(*) FILTER (WHERE 
        (old_string_value IS NOT NULL OR old_double_value IS NOT NULL OR old_datetime_value IS NOT NULL OR old_clob_value IS NOT NULL)
        AND (new_string_value IS NULL AND new_double_value IS NULL AND new_datetime_value IS NULL AND new_clob_value IS NULL)
      ) AS removed,
      COUNT(*) FILTER (WHERE attribute_code = 'activeFlag' AND new_string_value = 'Y') AS activated,
      COUNT(*) FILTER (WHERE attribute_code = 'activeFlag' AND new_string_value = 'N') AS deactivated
    FROM ${PREFIX}audit
    WHERE app_id = $1
  `;
  const changeTypesResult = await client.query(changeTypesSql, [appId]);
  const changeTypes = changeTypesResult.rows[0];

  const added = Number(changeTypes.added) || 0;
  const removed = Number(changeTypes.removed) || 0;
  const activated = Number(changeTypes.activated) || 0;
  const deactivated = Number(changeTypes.deactivated) || 0;
  const total = Number(counts.total) || 0;
  // Modified is everything that's not in the other categories
  const modified = total - added - removed - activated - deactivated;

  return {
    total,
    uniqueEntities: Number(counts.unique_entities) || 0,
    uniqueUsers: Number(counts.unique_users) || 0,
    uniqueDatasources: Number(counts.unique_datasources) || 0,
    latestUpdate: counts.latest_update ? new Date(counts.latest_update).toISOString() : null,
    changesByType: {
      added,
      removed,
      modified: Math.max(0, modified),
      activated,
      deactivated,
    },
  };
}

/**
 * Query distinct values for smart search filter options.
 */
export async function queryAuditFilterOptions({
  client,
}: {
  client: PgPoolClient;
  session: Session;
}): Promise<AuditFilterOptions> {
  const appId = getConfig('queryAuditFilterOptions').appId;

  // Fetch all distinct values in parallel
  const [datasourcesResult, usersResult, attributesResult, valueTypesResult] = await Promise.all([
    client.query<{ datasource_id: string }>(
      `SELECT DISTINCT datasource_id FROM ${PREFIX}audit WHERE app_id = $1 ORDER BY datasource_id`,
      [appId],
    ),
    client.query<{ updated_by: string }>(
      `SELECT DISTINCT updated_by FROM ${PREFIX}audit WHERE app_id = $1 ORDER BY updated_by`,
      [appId],
    ),
    client.query<{ attribute_code: string }>(
      `SELECT DISTINCT attribute_code FROM ${PREFIX}audit WHERE app_id = $1 ORDER BY attribute_code`,
      [appId],
    ),
    client.query<{ value_type: string }>(
      `SELECT DISTINCT value_type FROM ${PREFIX}audit WHERE app_id = $1 ORDER BY value_type`,
      [appId],
    ),
  ]);

  return {
    datasources: datasourcesResult.rows.map((r) => r.datasource_id),
    users: usersResult.rows.map((r) => r.updated_by),
    attributes: attributesResult.rows.map((r) => r.attribute_code),
    valueTypes: valueTypesResult.rows.map((r) => r.value_type),
  };
}
