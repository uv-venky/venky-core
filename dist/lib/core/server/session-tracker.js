import { transaction } from '../../../lib/core/server/db';
import logger from '../../../lib/core/server/logger';
import { PREFIX } from '../../../lib/server/constants';
import { shutdownListener } from '../../../lib/core/server/listener';
import { shutdownActivityBuffer } from '../../../lib/core/server/activity';
import { alertFooter, sendGoogleChatAlert, serverInfoBlock } from '../../../lib/core/server/google-chat';
import { getConfig } from './config';
function partitionMap(src, predicate) {
    const pass = new Map();
    const fail = new Map();
    for (const [key, value] of src) {
        (predicate(value, key, src) ? pass : fail).set(key, value);
    }
    return [pass, fail];
}
const UPDATE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
class SessionTracker {
    sessionCache = new Map();
    flushInterval = null;
    constructor() {
        // logger.info('Initializing session tracker');
        this.flushInterval = setInterval(() => {
            this.flushToDatabase().catch((error) => {
                logger.error('Failed to flush session tracker to database', error);
            });
        }, UPDATE_THRESHOLD_MS + 1000);
    }
    updateSessionAccess(sessionId, expiresAt) {
        const now = Date.now();
        const existing = this.sessionCache.get(sessionId);
        if (existing) {
            existing.lastAccessedAt = now;
            existing.expiresAt = expiresAt;
        }
        else {
            // First time seeing this session
            this.sessionCache.set(sessionId, {
                lastAccessedAt: now,
                expiresAt,
                lastUpdatedAt: now,
            });
        }
    }
    async flushToDatabase(all = false) {
        const now = Date.now();
        const [sessionsToUpdate, sessionsToSkip] = all
            ? [this.sessionCache, new Map()]
            : partitionMap(this.sessionCache, (session) => now - session.lastUpdatedAt > UPDATE_THRESHOLD_MS);
        this.sessionCache = sessionsToSkip;
        const appId = getConfig('updateSessionAccess').appId;
        if (sessionsToUpdate.size === 0) {
            return;
        }
        try {
            await transaction(async (client) => {
                // Batch update all sessions that need updating
                for (const [sessionId, session] of sessionsToUpdate.entries()) {
                    await client.query(`UPDATE ${PREFIX}user_sessions 
           SET last_accessed_at = $1, expires_at = $2 
           WHERE session_id = $3 AND app_id = $4`, [new Date(session.lastAccessedAt), session.expiresAt, sessionId, appId]);
                }
            });
        }
        catch (error) {
            logger.error('Failed to flush session tracker to database', error);
        }
        if (logger.debugEnabled) {
            logger.debug(`Flushed ${sessionsToUpdate.size} session updates to database`);
        }
    }
    async shutdown() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        // Shutdown the PostgreSQL listener first
        try {
            await shutdownListener();
        }
        catch (error) {
            logger.error('Failed to shutdown listener', error);
        }
        // Shutdown the activity buffer
        try {
            await shutdownActivityBuffer();
        }
        catch (error) {
            logger.error('Failed to shutdown activity buffer', error);
        }
        // Final flush before shutdown with timeout
        if (this.sessionCache.size > 0) {
            try {
                const flushPromise = this.flushToDatabase(true);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown flush timeout')), 5000));
                await Promise.race([flushPromise, timeoutPromise]);
            }
            catch (error) {
                logger.error('Failed to flush sessions during shutdown', error);
                // Don't throw - we want to continue with shutdown even if flush fails
            }
        }
    }
    // Get cache stats for monitoring
    getStats() {
        const now = Date.now();
        return {
            totalSessions: this.sessionCache.size,
            sessionsNeedingUpdate: Array.from(this.sessionCache.values()).filter((s) => now - s.lastUpdatedAt > UPDATE_THRESHOLD_MS).length,
        };
    }
}
const ensureSessionTracker = () => {
    if (process.env.NODE_ENV !== 'production') {
        // no session tracker is needed in development/test
        return {
            updateSessionAccess: () => { },
            shutdown: () => Promise.resolve(),
            getStats: () => ({
                totalSessions: 0,
                sessionsNeedingUpdate: 0,
            }),
        };
    }
    if (globalThis._$sessionTracker instanceof SessionTracker) {
        return globalThis._$sessionTracker;
    }
    const tracker = new SessionTracker();
    globalThis._$sessionTracker = tracker;
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        if (globalThis._$isShuttingDown) {
            // logger.warn(`Already shutting down, ignoring ${signal}`, {
            //   pid: process.pid,
            // });
            return;
        }
        globalThis._$isShuttingDown = true;
        logger.info(`Received ${signal}, starting graceful shutdown...`, {
            pid: process.pid,
        });
        if (process.env.NODE_ENV === 'production') {
            sendGoogleChatAlert(`🔴 *Server Shutting Down*
• Signal: ${signal}
• PID: ${process.pid}
${await serverInfoBlock()}
${alertFooter()}`);
        }
        // Set a timeout to force exit if shutdown takes too long
        const shutdownTimeout = setTimeout(() => {
            logger.warn('Shutdown timeout reached, forcing exit');
            process.exit(1);
        }, 10000); // 10 seconds timeout
        try {
            await tracker.shutdown();
            logger.info('Graceful shutdown completed');
        }
        catch (error) {
            logger.error('Failed to shutdown session tracker', error);
        }
        finally {
            clearTimeout(shutdownTimeout);
            process.exit(0);
        }
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    return tracker;
};
// Singleton instance
export const sessionTracker = ensureSessionTracker();
//# sourceMappingURL=session-tracker.js.map