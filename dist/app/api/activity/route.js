import logger from '../../../lib/core/server/logger';
import { withSessionRoute } from '../../../lib/core/server/withDBRoutes';
import { logActivity } from '../../../lib/core/server/activity';
import { APP_VERSION } from '../../../lib/app-info';
import { isAbortedRequestError, UserError } from '../../../lib/core/common/error';
export const POST = withSessionRoute(async function callback(session, req) {
  let activity;
  try {
    activity = await req.json();
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
//# sourceMappingURL=route.js.map
