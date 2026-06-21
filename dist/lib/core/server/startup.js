import { migrate } from '../../../lib/core/server/migrate';
import { startListener } from '../../../lib/core/server/listener';
import { startScheduler } from '../../../lib/server/jobs/scheduler';
import logger, { enableDbLogging } from '../../../lib/core/server/logger';
import { getConfig } from '../../../lib/core/server/config';
import { alertFooter, sendGoogleChatAlert, serverInfoBlock } from '../../../lib/core/server/google-chat';
import { cacheAutoLoginSession } from '../../../auth';
/**
 * Wait for server startup to complete.
 * This is used by auth() to wait for the auto-login session to be cached
 * before processing requests when AUTO_LOGIN_USER is set.
 */
export async function waitForStartup() {
  // If already complete, return immediately
  if (globalThis._$startupComplete) {
    return;
  }
  // If startup hasn't started yet, wait a bit and check again
  if (!globalThis._$startupPromise) {
    // Wait for startup to start (max 5 seconds)
    for (let i = 0; i < 50; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (globalThis._$startupPromise || globalThis._$startupComplete) {
        break;
      }
    }
  }
  // Wait for the startup promise to resolve
  if (globalThis._$startupPromise) {
    await globalThis._$startupPromise;
  }
}
export default async function startup() {
  if (globalThis._$startupComplete) {
    logger.warn('Startup already complete, skipping...');
    return;
  }
  // Create a promise that will resolve when startup completes
  globalThis._$startupPromise = new Promise((resolve) => {
    globalThis._$startupResolve = resolve;
  });
  await migrate();
  await enableDbLogging();
  if (process.env.NODE_ENV === 'production') {
    void import('../../../lib/server/jobs/handlers/memory-sampler')
      .then(({ recordStartupSample }) => recordStartupSample())
      .catch(() => {
        /* never fail boot */
      });
  }
  logger.info(`Starting up on pid ${process.pid}`);
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`PRODUCTION_EMAILS: ${process.env.PRODUCTION_EMAILS === 'true'}`);
  logger.info(`TEST_EMAIL: ${process.env.TEST_EMAIL}`);
  logger.info(`APP_URL: ${process.env.APP_URL}`);
  logger.info(`RUN_SCHEDULER: ${process.env.RUN_SCHEDULER === 'true'}`);
  const { adminAlertEmails } = getConfig('init');
  if ((adminAlertEmails?.length ?? 0) === 0) {
    logger.warn('No admin alert emails configured!');
  } else {
    logger.info(`Admin alert emails: ${adminAlertEmails.join(', ')}`);
  }
  if (process.env.AUTO_LOGIN_USER) {
    await cacheAutoLoginSession();
  }
  // defer to finish initializing
  setTimeout(() => {
    void (async () => {
      startListener();
      if (process.env.RUN_SCHEDULER === 'true' || process.env.NODE_ENV === 'production') {
        await startScheduler();
      }
    })().catch((error) => {
      logger.error('Failed to start deferred server services', error);
    });
  }, 300);
  if (process.env.NODE_ENV === 'production') {
    sendGoogleChatAlert(`🟢 *Server Started*
• PID: ${process.pid}
${await serverInfoBlock()}
${alertFooter()}`);
  }
  // Mark startup as complete and resolve the promise
  globalThis._$startupComplete = true;
  if (globalThis._$startupResolve) {
    globalThis._$startupResolve();
    globalThis._$startupPromise = undefined;
    globalThis._$startupResolve = undefined;
  }
}
//# sourceMappingURL=startup.js.map
