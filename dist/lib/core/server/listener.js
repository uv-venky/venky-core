import { newClient } from '../../../lib/core/server/db';
import logger from '../../../lib/core/server/logger';
import { getErrorMessage } from '../../../lib/core/common/error';
import { onServerEvent } from './server-events';
import { sseRegistry } from '../../../lib/sse/server/registry';
export const RETRY_ATTEMPTS = 30;
export const RETRY_BASE_DELAY = 1;
export const RETRY_MAX_DELAY = 120;
/**
 * Calculates a timeout in seconds based on the retry attempt number.
 * Uses exponential back-off and caps the delay at a specified maximum.
 *
 * @param attempt - The current retry attempt number (starting from 0)
 * @param baseDelay - The starting delay in seconds (default is 1 second)
 * @param maxDelay - The maximum delay in seconds (default is 60 seconds)
 * @returns The calculated timeout in seconds.
 */
export function getRetryTimeout(attempt) {
  // Exponential backoff: delay = baseDelay * 2^attempt
  const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
  // Return the delay capped at the maximum delay value
  return Math.min(delay, RETRY_MAX_DELAY) * 1000;
}
let client = null;
let attempt = 1;
let isShuttingDown = false;
export async function startListener() {
  if (isShuttingDown) {
    return;
  }
  try {
    client = await newClient();
    // Listen for errors on the client
    client.on('error', (err) => {
      logger.error('PostgreSQL client error:', err);
      // Clean up and reconnect when an error occurs
      if (!isShuttingDown) {
        cleanupAndReconnect();
      }
    });
    // Optional: listen for the "end" event if the connection closes unexpectedly
    client.on('end', () => {
      logger.warn('PostgreSQL connection ended');
      if (!isShuttingDown) {
        cleanupAndReconnect();
      }
    });
    // Start listening on the desired channel
    await client.query('LISTEN VENKY_events');
    logger.info('Listening for notifications on "VENKY_events"...');
    client.on('notification', (msg) => {
      if (msg.payload) {
        try {
          const [eventName, payload] = JSON.parse(msg.payload);
          // Handle SSE events by broadcasting to connected clients
          if (eventName === 'sse') {
            const ssePayload = payload;
            sseRegistry.broadcast(ssePayload.channel, ssePayload.data);
          } else {
            // Handle other server events
            onServerEvent(eventName, payload);
          }
        } catch (error) {
          logger.error('Error parsing notification payload:', getErrorMessage(error));
          logger.error('Notification payload:', msg.payload);
        }
      }
    });
  } catch (err) {
    logger.error('Error connecting to PostgreSQL:', getErrorMessage(err));
    if (attempt < RETRY_ATTEMPTS && !isShuttingDown) {
      cleanupAndReconnect();
    } else if (!isShuttingDown) {
      cleanup();
      logger.error('Max retry attempts reached. Giving up.');
      process.exit(1);
    }
  }
}
function cleanup() {
  try {
    // Attempt to close the existing client connection gracefully
    client?.release();
    client = null;
  } catch (e) {
    logger.error('Error during cleanup:', e);
  }
}
async function cleanupAndReconnect() {
  cleanup();
  if (isShuttingDown) {
    return;
  }
  logger.info('Cleaning up and reconnecting...');
  setTimeout(startListener, getRetryTimeout(attempt++));
}
export async function shutdownListener() {
  isShuttingDown = true;
  if (client) {
    // Try to unlisten, but don't hang if the client is in a bad state
    try {
      const unlistenPromise = client.query('UNLISTEN VENKY_events');
      const unlistenTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('UNLISTEN timeout')), 2000));
      await Promise.race([unlistenPromise, unlistenTimeout]);
    } catch (error) {
      logger.error('Error unlistening from VENKY_events:', error);
      logger.info('Continuing with shutdown despite UNLISTEN failure');
    }
    try {
      const releasePromise = Promise.resolve(client.release());
      const releaseTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('client.release() timeout')), 2000),
      );
      await Promise.race([releasePromise, releaseTimeout]);
    } catch (error) {
      logger.error('Error releasing listener client:', error);
    }
    client = null;
  } else {
    logger.warn('No client to shutdown.');
  }
}
//# sourceMappingURL=listener.js.map
