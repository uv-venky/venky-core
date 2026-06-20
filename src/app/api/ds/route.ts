import { postDataSource, queryDataSource } from '@/lib/core/server/ds';
import logger from '@/lib/core/server/logger';
import type { PgPoolClient } from '@/lib/core/server/db';
import { withDBSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import { getDataSource } from '@/lib/server/ds/defs/ds';
import { isAbortedRequestError, UserError } from '@/lib/core/common/error';
import { parseDsRequest, validateQuery } from './request-schema';

export const POST = withDBSessionRoute(async function callback(client: PgPoolClient, session: Session, req: Request) {
  let raw: unknown;

  try {
    raw = await req.json();
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    throw new UserError('Invalid request body');
  }

  // Reject any unknown top-level field before doing any work (UserError → 400).
  const { ds: dsName, query, rows: rowsToPost, debug } = parseDsRequest(raw);

  if (!dsName || (!query && !rowsToPost)) {
    throw new UserError('Invalid request');
  }

  if (query) {
    validateQuery(query);
  }

  logger.setContext('dataSource', dsName);
  logger.setContext('apiName', 'ds');

  if (logger.debugEnabled) {
    logger.debug('Start', query ? 'query' : `${rowsToPost?.length} rows`);
  }
  // logger.info(`Getting data source ${dsName} from ${Object.keys(getAllDataSources()).length} data sources`);
  const ds = getDataSource<any>(dsName);
  if (!ds) {
    throw new UserError(`Data source ${dsName} not found!`);
  }

  const result = query
    ? await queryDataSource(client, session, ds, query)
    : await postDataSource(client, session, ds, rowsToPost ?? [], {
        sourceTrackId: req.headers.get('X-Track-Id') ?? undefined,
      });
  const { rows, elapsed, params, sql, count } = result;

  if (logger.traceEnabled) {
    logger.trace('End', { elapsed, params, sql, count, rows: rows.length });
  }
  if (debug) {
    return Response.json({
      status: 'OK',
      rows,
      elapsed,
      params,
      sql,
      count,
    });
  } else {
    return Response.json({ status: 'OK', rows, count });
  }
});

export const runtime = 'nodejs';
