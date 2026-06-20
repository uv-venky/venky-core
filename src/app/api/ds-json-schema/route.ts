import type { Session } from '@/auth';
import { isAbortedRequestError, UserError } from '@/lib/core/common/error';
import { withSessionRoute } from '@/lib/core/server/withDBRoutes';
import logger from '@/lib/core/server/logger';
import { getDataSource } from '@/lib/server/ds/defs/ds';
import { gen_ds_json_query_schema } from './gen-json-query-schema';
import { gen_ds_json_post_schema } from './gen-json-post-schema';

type Payload = { ds: string; type: 'Query' | 'Post' };

export const POST = withSessionRoute(async function callback(_session: Session, req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch (error) {
    if (isAbortedRequestError(error)) {
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    throw new UserError('Invalid request body');
  }

  const { ds: dsName, type = 'Query' } = body;
  const ds = getDataSource<any>(dsName);
  if (!ds) {
    throw new UserError(`Data source ${dsName} not found!`);
  }
  const schema = type === 'Query' ? await gen_ds_json_query_schema(ds) : await gen_ds_json_post_schema(ds);
  return Response.json({ status: 'OK', schema });
});

export const runtime = 'nodejs';
