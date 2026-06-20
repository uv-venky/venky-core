/* Copyright (c) 2024-present Venky Corp. */

import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import type { DBRow, Query } from '@/lib/core/common/ds/types/filter';
import logger from '@/lib/core/server/logger';
import type { PgPoolClient } from '@/lib/core/server/db';
import type { QueryResult } from '@/lib/core/server/ds/ds_types';
import { hasAccess } from '@/lib/core/server/ds/hasAccess';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import { getErrorMessage, UserError } from '@/lib/core/common/error';
import type { Session } from '@/auth';
import { logAccessDenied, logActivity } from '@/lib/core/server/activity';
import { AccessDeniedResourceType } from '@/lib/core/common/types/AccessDenied';
import type { Activity } from '@/lib/core/common/types/Activity';
import { areEqualShallow } from '@/lib/core/common/isEmpty';
import { formatDate } from 'date-fns';
import { polygonStringToCoordinates } from '@/lib/core/common/ds/types/polygon-utils';

export async function queryDataSource<T extends object>(
  client: PgPoolClient,
  session: Session,
  ds: DataSource<T>,
  query: Query<T>,
): Promise<QueryResult<T>> {
  let localQuery = query;
  if (!(await hasAccess(ds, session, 'Query'))) {
    await logAccessDenied({
      userName: session.user.userName,
      roles: session.user.roles,
      sessionId: session.id,
      resourceType: AccessDeniedResourceType.DataSourceQuery,
      resource: ds.id,
      reason: `Query denied for data source ${ds.id}`,
    });
    throw new UserError(`Access denied! Query denied for data source ${ds.id}`);
  }
  const start = performance.now();
  const qb = new QueryBuilder<T>(ds, session);
  if (ds.preQuery) {
    localQuery = await ds.preQuery({ query, session, client });
  }
  qb.applyQuery(localQuery);
  let sql = localQuery.countOnly ? qb.getCountQuery() : qb.getQuery();
  let params = localQuery.countOnly ? qb.getCountParams() : qb.getParams();
  if (ds.preQuery2) {
    ({ sql, params } = ds.preQuery2({ query, sql, params, session, client }));
  }
  let result: QueryResult<T>;
  try {
    if (logger.debugEnabled) {
      logger.debug('SQL:', sql);
      logger.debug('Params:', params);
    }
    if (ds.cached) {
      result = await client.queryCached<DBRow<T>>(sql, params);
    } else {
      result = await client.query<DBRow<T>>(sql, params);
    }
  } catch (e) {
    logger.error(getErrorMessage(e));
    logger.error('sql:', sql);
    logger.error('params:', params);
    throw new UserError(`${ds.id}: ${getErrorMessage(e)}`);
  }
  let rows = result.rows;
  if (!localQuery.countOnly && rows.length > 0) {
    // Process attributes that need transformation
    for (const attr of ds.attributes) {
      if (attr.type === 'Date' && attr.excludeTime) {
        for (const row of rows) {
          const value = row[attr.code] as unknown as string | Date;
          if (value instanceof Date) {
            // @ts-expect-error TypeScript doesn't know that row[attr.code] is a string
            row[attr.code] = formatDate(value, 'yyyy-MM-dd');
          } else if (value && typeof value === 'string') {
            // @ts-expect-error TypeScript doesn't know that row[attr.code] is a string
            row[attr.code] = value.split('T')[0];
          }
        }
      } else if (attr.type === 'Polygon') {
        for (const row of rows) {
          const value = row[attr.code] as unknown as string;
          if (value && typeof value === 'string') {
            try {
              // @ts-expect-error TypeScript doesn't know that row[attr.code] can be assigned coordinates array
              row[attr.code] = polygonStringToCoordinates(value);
            } catch (error) {
              logger.error(`Failed to parse polygon string for attribute ${attr.code}:`, value, error);
            }
          }
        }
      } else if (attr.type === 'Vector') {
        for (const row of rows) {
          const value = row[attr.code] as unknown as string;
          if (value != null && typeof value === 'string' && value.startsWith('[')) {
            try {
              const parsed = JSON.parse(value) as unknown;
              if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'number' && Number.isFinite(x))) {
                // @ts-expect-error vector column parsed to number[]
                row[attr.code] = parsed;
              }
            } catch (error) {
              logger.error(`Failed to parse vector string for attribute ${attr.code}:`, value, error);
            }
          }
        }
      }
    }
  }
  if (ds.postQuery && !localQuery.countOnly) {
    rows = await ds.postQuery({ query: localQuery, rows, session, client });
  }
  const elapsed = Math.round(performance.now() - start);
  const count = localQuery.countOnly ? ((rows[0] as unknown as { count: number })?.count ?? 0) : undefined;
  if (logger.debugEnabled) {
    if (localQuery.countOnly) {
      logger.debug(`fetched count: ${count} in ${elapsed} ms`);
    } else {
      logger.debug(`fetched: ${rows.length} rows in ${elapsed} ms`);
    }
  }
  // Use string eventId only (ds can be wrong if queryDataSource was called with wrong arg order)
  const dsId = typeof ds?.id === 'string' ? ds.id : 'unknown';
  const activity: Activity = {
    userName: session.user.userName,
    eventType: 'Query',
    eventId: dsId,
    metadata: {
      query,
      sql,
      params,
    },
    rowCount: rows.length,
    dataSource: dsId,
    elapsedTimeMs: elapsed,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  };
  if (!areEqualShallow(query, localQuery)) {
    activity.metadata = {
      ...activity.metadata,
      finalQuery: localQuery,
    };
  }
  await logActivity(activity);
  return {
    rows,
    fields: result.fields,
    elapsed,
    sql,
    params,
    count,
  };
}
