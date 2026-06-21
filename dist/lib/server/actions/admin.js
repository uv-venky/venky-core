import { getActivityEvents } from '../../../app/(secure)/admin/monitoring/activity/data';
import { queryAuditStats, queryAuditFilterOptions } from '../../../app/(secure)/admin/monitoring/audit/actions';
import {
  getCacheStatsAction as getCacheStatsImpl,
  clearCacheAction as clearCacheImpl,
} from '../../../app/(secure)/admin/monitoring/cache/action';
import {
  getJobDashboardAction as getJobDashboardImpl,
  getJobHistoryAction as getJobHistoryImpl,
  triggerJobAction as triggerJobImpl,
  getSchedulerNodesAction as getSchedulerNodesImpl,
} from '../../../app/(secure)/admin/monitoring/jobs/action';
import { sendTestEmailWithSession as sendTestEmailImpl } from '../../../lib/core/server/email';
import { resendEmailRequest as resendEmailRequestImpl } from '../../../app/(secure)/admin/monitoring/email-requests/action';
import { getServer } from '../../../lib/core/server/Server';
import { PREFIX } from '../constants';
import { logActivity } from '../../../lib/core/server/activity';
async function getActivityEventsAction(client, session, filters) {
  return getActivityEvents({ client, _session: session, filters });
}
async function getAuditStatsAction(client, session) {
  return queryAuditStats({
    client,
    session,
  });
}
async function getAuditFilterOptionsAction(client, session) {
  return queryAuditFilterOptions({
    client,
    session,
  });
}
async function sendTestEmailAction(client, session) {
  return sendTestEmailImpl(client, session);
}
async function resendEmailRequestAction(client, session, requestId) {
  return resendEmailRequestImpl(client, session, requestId);
}
const PROFILE_SETTING_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
async function updateProfileAction(client, session, key, value) {
  const start = Date.now();
  const { user } = session;
  const { userName } = user;
  if (typeof key !== 'string' || !PROFILE_SETTING_KEY_PATTERN.test(key)) {
    throw new Error(`Invalid profile setting key: ${typeof key === 'string' ? key.slice(0, 40) : typeof key}`);
  }
  getServer('profile').config.validateProfileUpdate(key, value, user);
  const result = await client.query(`UPDATE ${PREFIX}users SET settings[$1] = $2 WHERE user_name = $3`, [
    key,
    JSON.stringify(value),
    userName,
  ]);
  if (result.rowCount === 0) {
    throw new Error('User not found');
  }
  await logActivity({
    userName: session.user.userName,
    eventType: 'Update Profile',
    eventId: key,
    metadata: {
      value,
    },
    elapsedTimeMs: Date.now() - start,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  });
  return { status: 'OK' };
}
export const ADMIN_ACTIONS = {
  getActivityEvents: getActivityEventsAction,
  getAuditStats: getAuditStatsAction,
  getAuditFilterOptions: getAuditFilterOptionsAction,
  updateProfile: updateProfileAction,
  getCacheStats: getCacheStatsImpl,
  clearCache: clearCacheImpl,
  sendTestEmail: sendTestEmailAction,
  resendEmailRequest: resendEmailRequestAction,
  getJobDashboard: getJobDashboardImpl,
  getJobHistory: getJobHistoryImpl,
  triggerJob: triggerJobImpl,
  getSchedulerNodes: getSchedulerNodesImpl,
};
const BASE_ROLES = ['admin'];
export const ADMIN_ACTION_ACCESS_ROLES = {
  getActivityEvents: [...BASE_ROLES],
  getAuditStats: [...BASE_ROLES],
  getAuditFilterOptions: [...BASE_ROLES],
  updateProfile: [...BASE_ROLES, 'all_users'],
  getCacheStats: [...BASE_ROLES],
  clearCache: [...BASE_ROLES],
  sendTestEmail: [...BASE_ROLES],
  resendEmailRequest: [...BASE_ROLES],
  getJobDashboard: [...BASE_ROLES],
  getJobHistory: [...BASE_ROLES],
  triggerJob: [...BASE_ROLES],
  getSchedulerNodes: [...BASE_ROLES],
};
//# sourceMappingURL=admin.js.map
