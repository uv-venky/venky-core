import { clearSessionCache } from '@/auth';
import type { PgPoolClient } from './db';
import logger from './logger';

export type ServerEvent = {
  clearSessionCache: {
    userName: string;
  };
};

export type ServerEventName = keyof ServerEvent;
export type ServerEventPayload<T extends ServerEventName> = ServerEvent[T];

export async function sendServerEvent<T extends ServerEventName>(
  client: PgPoolClient,
  eventName: T,
  payload: ServerEventPayload<T>,
) {
  await client.query(`SELECT pg_notify('VENKY_events', $1)`, [JSON.stringify([eventName, payload])]);
}

export function onServerEvent<T extends ServerEventName>(eventName: T, payload: ServerEventPayload<T>) {
  switch (eventName) {
    case 'clearSessionCache':
      logger.info('Clearing session cache for user', payload.userName);
      clearSessionCache(payload.userName).catch((error) => logger.error('Error clearing session cache', error));
      break;
    default:
      logger.error(`Unknown server event name: ${eventName}`, payload);
  }
}
