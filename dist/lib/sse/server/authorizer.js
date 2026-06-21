/* Copyright (c) 2024-present Venky Corp. */
import logger from '../../../lib/core/server/logger';
import { newReadOnlyClient } from '../../../lib/core/server/db';
import { PREFIX } from '../../../lib/server/constants';
import { getDataSource } from '../../../lib/server/ds/defs/ds';
import { hasAccess } from '../../../lib/core/server/ds/hasAccess';
import { authorizeCommentAccess } from '../../../components/core/comments/comment-authorizer';
const registry = globalThis._$sseChannelAuthorizers ?? new Map();
globalThis._$sseChannelAuthorizers = registry;
/**
 * Register an authorizer for a channel prefix. The channel string passed to the
 * authorizer includes the full channel name (prefix + suffix); the authorizer
 * extracts the id portion and decides whether the session may subscribe.
 *
 * Example:
 *   registerChannelAuthorizer('custom:po-status:', async (channel, session) => {
 *     const poId = channel.slice('custom:po-status:'.length);
 *     return userCanSeePO(session.user.userName, poId);
 *   });
 */
export function registerChannelAuthorizer(prefix, fn) {
    registry.set(prefix, fn);
}
function findRegisteredAuthorizer(channel) {
    // Longest-prefix match so `custom:po-status:` wins over `custom:`.
    let best;
    for (const [prefix, fn] of registry) {
        if (channel.startsWith(prefix)) {
            if (!best || prefix.length > best.prefix.length) {
                best = { prefix, fn };
            }
        }
    }
    return best?.fn;
}
async function canAccessWorkflow(channel, session) {
    const workflowId = channel.slice('workflow:'.length);
    if (!workflowId)
        return false;
    const client = await newReadOnlyClient();
    try {
        const result = await client.query(`
        SELECT id
        FROM ${PREFIX}workflows
        WHERE id = $1 AND user_name = $2
        LIMIT 1
      `, [workflowId, session.user.userName]);
        return result.rows.length > 0;
    }
    finally {
        client.release();
    }
}
async function canAccessExecution(channel, session) {
    const executionId = channel.slice('execution:'.length);
    if (!executionId)
        return false;
    const client = await newReadOnlyClient();
    try {
        const result = await client.query(`
        SELECT e.id
        FROM ${PREFIX}workflow_executions e
        INNER JOIN ${PREFIX}workflows w ON w.id = e.workflow_id
        WHERE e.id = $1 AND w.user_name = $2
        LIMIT 1
      `, [executionId, session.user.userName]);
        return result.rows.length > 0;
    }
    finally {
        client.release();
    }
}
async function canAccessDataSource(channel, session) {
    const datasourceId = channel.slice('data:'.length);
    if (!datasourceId)
        return false;
    try {
        const ds = getDataSource(datasourceId);
        if (!ds) {
            return false;
        }
        return hasAccess(ds, session, 'Query');
    }
    catch (err) {
        logger.warn('[SSE Authorizer] Rejecting data channel for unknown datasource', {
            channel,
            userName: session.user.userName,
            err,
        });
        return false;
    }
}
async function canAccessComment(channel, session) {
    const parts = channel.split(':');
    if (parts.length < 3) {
        return false;
    }
    const [, context, ...contextIdParts] = parts;
    const contextId = contextIdParts.join(':');
    if (!context || !contextId) {
        return false;
    }
    return authorizeCommentAccess(context, contextId, session);
}
/**
 * Returns true if the session user is allowed to subscribe to the channel.
 */
export async function authorizeSSEChannel(channel, session) {
    const userName = session?.user?.userName;
    if (!userName)
        return false;
    if (channel === '_system')
        return true;
    if (channel === 'job:status') {
        return session.user.roles?.includes('admin') ?? false;
    }
    if (channel.startsWith('notification:')) {
        return channel.slice('notification:'.length) === userName;
    }
    if (channel.startsWith('workflow:')) {
        return canAccessWorkflow(channel, session);
    }
    if (channel.startsWith('execution:')) {
        return canAccessExecution(channel, session);
    }
    if (channel.startsWith('data:')) {
        return canAccessDataSource(channel, session);
    }
    if (channel.startsWith('comment:')) {
        return canAccessComment(channel, session);
    }
    if (channel.startsWith('custom:')) {
        const fn = findRegisteredAuthorizer(channel);
        if (!fn) {
            logger.warn('[SSE Authorizer] Rejecting channel with no registered authorizer', {
                channel,
                userName,
            });
            return false;
        }
        try {
            return await fn(channel, session);
        }
        catch (err) {
            logger.error('[SSE Authorizer] Authorizer threw; denying', { channel, err });
            return false;
        }
    }
    // Unknown channel shape — deny.
    logger.warn('[SSE Authorizer] Rejecting unknown channel shape', { channel, userName });
    return false;
}
/**
 * Filters a list of requested channels to those the session is allowed to
 * subscribe to. Returns the allowed set and the denied set for logging.
 */
export async function authorizeSSEChannels(channels, session) {
    const allowed = [];
    const denied = [];
    await Promise.all(channels.map(async (ch) => {
        if (await authorizeSSEChannel(ch, session)) {
            allowed.push(ch);
        }
        else {
            denied.push(ch);
        }
    }));
    return { allowed, denied };
}
//# sourceMappingURL=authorizer.js.map