import logger from '@/lib/core/server/logger';
import { withSessionRoute } from '@/lib/core/server/withDBRoutes';
import type { Session } from '@/auth';
import { logActivity } from '@/lib/core/server/activity';
import { APP_VERSION } from '@/lib/app-info';
import { isAbortedRequestError, UserError } from '@/lib/core/common/error';
import type { Activity } from '@/lib/core/common/types/Activity';

export const POST = withSessionRoute(async function callback(session: Session, req: Request) {
  let activity: Activity;
  try {
    activity = (await req.json()) as Activity;
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    throw new UserError('Invalid request body');
  }

  if (activity.dataSource) {
    logger.setContext('dataSource', activity.dataSource);
  }
  if (activity.apiName) {
    logger.setContext('apiName', activity.apiName);
  }
  if (activity.appVersion) {
    logger.setContext('appVersion', activity.appVersion);
  }
  await logActivity({
    ...activity,
    userName: session.user.userName,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
    appVersion: APP_VERSION,
  });
  return Response.json({ status: 'OK' });
});

export const runtime = 'nodejs';
