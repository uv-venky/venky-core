/* Copyright (c) 2024-present Venky Corp. */
import { signOut } from '../../../auth';
import { getAppConfigForDevtools, getEnvironment, getSystemInfo, getUserSession, } from '../../../lib/core/server/session';
import { getRequestContext } from '../../../lib/core/server/request-context';
import { logActivity } from '../../../lib/core/server/activity';
import { PREFIX } from '../constants';
async function getUserSessionAction(_client, _session) {
    return getUserSession();
}
async function saveChatModelAsCookieAction(_client, _session, model) {
    const ctx = getRequestContext('saveChatModelAsCookie');
    ctx.setCookie('chat-model', model);
}
async function getEnvironmentAction(_client, _session) {
    return getEnvironment();
}
async function getAppConfigForDevtoolsAction(_client, _session) {
    return getAppConfigForDevtools();
}
async function getSystemInfoAction(_client, _session) {
    return getSystemInfo();
}
async function signOutAction(_client, _session) {
    return signOut();
}
async function updateAvatarAction(client, session, image) {
    const start = Date.now();
    const { user } = session;
    const result = await client.query(`UPDATE ${PREFIX}users SET picture = $1, updated_at = NOW(), updated_by = $2 WHERE user_name = $2`, [image, user.userName]);
    if (result.rowCount === 0) {
        throw new Error('User not found');
    }
    await logActivity({
        userName: session.user.userName,
        eventType: 'Update Avatar',
        eventId: 'avatar',
        elapsedTimeMs: Date.now() - start,
        sessionId: session.id,
        createdAt: new Date().toISOString(),
    });
    return { status: 'OK' };
}
async function signOutOthersAction(client, session) {
    const start = Date.now();
    const { user } = session;
    await client.query(`UPDATE ${PREFIX}user_sessions SET signed_out_at = NOW() WHERE user_name = $1 AND session_id != $2`, [user.userName, session.id]);
    await client.query(`INSERT INTO ${PREFIX}user_sessions_arch (
      user_name,
      user_id,
      session_id,
      ip_address,
      user_agent,
      csrf_token,
      expires_at,
      signed_in_at,
      last_accessed_at,
      signed_out_at,
      app_id,
      metadata
    ) SELECT
      user_name,
      user_id,
      session_id,
      ip_address,
      user_agent,
      csrf_token,
      expires_at,
      signed_in_at,
      last_accessed_at,
      signed_out_at,
      app_id,
      metadata
    FROM ${PREFIX}user_sessions WHERE user_name = $1 AND signed_out_at IS NOT NULL`, [user.userName]);
    const result = await client.query(`DELETE FROM ${PREFIX}user_sessions WHERE user_name = $1 AND signed_out_at IS NOT NULL`, [user.userName]);
    await logActivity({
        userName: session.user.userName,
        eventType: 'Sign Out Others',
        eventId: session.user.userName,
        rowCount: result.rowCount ?? 0,
        elapsedTimeMs: Date.now() - start,
        sessionId: session.id,
        createdAt: new Date().toISOString(),
    });
}
export const SESSION_ACTIONS = {
    getUserSession: getUserSessionAction,
    getEnvironment: getEnvironmentAction,
    getAppConfigForDevtools: getAppConfigForDevtoolsAction,
    getSystemInfo: getSystemInfoAction,
    signOut: signOutAction,
    saveChatModelAsCookie: saveChatModelAsCookieAction,
    updateAvatar: updateAvatarAction,
    signOutOthers: signOutOthersAction,
};
export const SESSION_ACTION_ACCESS_ROLES = {
    getUserSession: ['all_users'],
    getEnvironment: ['all_users'],
    getAppConfigForDevtools: ['all_users'],
    getSystemInfo: ['all_users'],
    signOut: ['all_users'],
    saveChatModelAsCookie: ['all_users'],
    updateAvatar: ['all_users'],
    signOutOthers: ['all_users'],
};
//# sourceMappingURL=session.js.map