import { newClient } from '@/lib/core/server/db';
import type { NextRequest } from 'next/server';
import QueryStream from 'pg-query-stream';
import { stringify } from 'csv-stringify';
import { Readable } from 'node:stream';
import type { Query } from '@/lib/core/common/ds/types/filter';
import logger from '@/lib/core/server/logger';
import type { Roles } from '@/lib/common/ds/types/core/Roles';
import { RolesDS } from '@/lib/server/ds/defs/core/RolesDS';
import { auth } from '@/auth';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ status: 'ERROR', message: 'Not authenticated' }, { status: 401 });
  }
  const roleCode = req.nextUrl.searchParams.get('roleCode');
  const filters = req.nextUrl.searchParams.get('filters');
  const client = await newClient();

  logger.setContext('apiName', 'sample-export');
  if (logger.debugEnabled) {
    logger.debug('Export params', { roleCode, filters });
  }

  try {
    const query: Query<Roles> = {
      filter: JSON.parse(filters ?? '[]'),
      data: {
        roleCode: roleCode ?? undefined,
      },
      sort: { roleCode: 1 },
    };
    const qb = new QueryBuilder<Roles>(RolesDS, session);
    qb.applyQuery(query);
    qb.skipPagination = true;
    const sql = qb.getQuery();
    const params = qb.getParams();
    logger.info(`csv-export sql: ${sql}`);
    logger.info(`csv-export params: ${params}`);
    const qs = new QueryStream(sql, params); // customize your query
    const dbStream = client.query(qs);

    const csvStream = stringify({
      header: true,
    });

    dbStream.on('error', (err) => {
      logger.error('DB stream error:', err);
      csvStream.destroy(err);
      client.release();
    });

    dbStream.on('end', () => {
      client.release();
    });

    dbStream.pipe(csvStream);

    // Convert Node stream -> Web ReadableStream
    const webStream = Readable.toWeb(csvStream) as globalThis.ReadableStream<Uint8Array>;

    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="export.csv"',
      },
    });
  } catch (err) {
    client.release();
    logger.error('Unexpected error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
