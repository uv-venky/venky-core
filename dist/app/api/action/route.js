import logger from '../../../lib/core/server/logger';
import { invokeAction } from '../../../lib/server/actions/invoke';
import { logActivity } from '../../../lib/core/server/activity';
import { withDBSessionRoute } from '../../../lib/core/server/withDBRoutes';
import { isAbortedRequestError, UserError } from '../../../lib/core/common/error';
function parseActionRequest(body) {
  const [action, ...rest] = body;
  return [action, rest];
}
export const POST = withDBSessionRoute(async function callback(client, session, req) {
  const start = performance.now();
  let body;
  try {
    body = await req.json();
  } catch (error) {
    if (isAbortedRequestError(error)) {
      return new Response(null, { status: 499 });
    }
    // Truncated JSON body from aborted requests — treat the same as abort
    if (error instanceof SyntaxError && error.message.includes('Unexpected end of JSON input')) {
      return new Response(null, { status: 499 });
    }
    logger.error('Failed to parse request body:', error);
    throw new UserError('Invalid request body');
  }
  const [action, params] = parseActionRequest(body);
  // Reject malformed payload: body[0] must be the action name string (not e.g. client/session from wrong caller)
  if (typeof action !== 'string' || !action.trim()) {
    logger.error('Action request first element was not a string', {
      type: typeof action,
      params,
    });
    throw new UserError('Invalid request: action name is required');
  }
  const actionName = action.trim();
  logger.setContext('dataSource', actionName);
  logger.setContext('apiName', 'action');
  if (logger.debugEnabled) {
    logger.debug('Start', actionName, ...params);
  }
  const result = await invokeAction(client, session, actionName, ...params);
  if (logger.debugEnabled) {
    logger.debug(
      'End',
      actionName,
      `${Math.round(performance.now() - start)}ms`,
      Array.isArray(result) ? `${result.length} rows` : undefined,
    );
  }
  await logActivity({
    userName: session.user.userName,
    eventType: 'Action',
    eventId: actionName,
    metadata: {
      params,
    },
    rowCount: Array.isArray(result) ? result.length : 0,
    elapsedTimeMs: Math.round(performance.now() - start),
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  });
  return Response.json({ status: 'OK', result });
});
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map
