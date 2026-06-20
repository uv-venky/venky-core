import logger from '@/lib/core/server/logger';
import { withSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import { APP_VERSION } from '@/lib/app-info';
import { isAbortedRequestError, UserError } from '@/lib/core/common/error';

type Payload = {
  message: string;
  dataSource?: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'trace' | 'log';
  appVersion?: string;
};

export const POST = withSessionRoute(async function callback(_session: Session, req: Request) {
  let body: Payload;

  try {
    body = (await req.json()) as Payload;
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    throw new UserError('Invalid request body');
  }

  const { message, dataSource, level, appVersion = APP_VERSION, ...rest } = body;

  if (dataSource) {
    logger.setContext('dataSource', dataSource);
  }

  if (appVersion) {
    logger.setContext('appVersion', appVersion);
  }
  logger[level](`[client] ${message}`, { ...rest });

  return Response.json({ status: 'OK' });
});

export const runtime = 'nodejs';
