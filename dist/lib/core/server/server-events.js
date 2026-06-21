import { clearSessionCache } from '../../../auth';
import logger from './logger';
export async function sendServerEvent(client, eventName, payload) {
    await client.query(`SELECT pg_notify('VENKY_events', $1)`, [JSON.stringify([eventName, payload])]);
}
export function onServerEvent(eventName, payload) {
    switch (eventName) {
        case 'clearSessionCache':
            logger.info('Clearing session cache for user', payload.userName);
            clearSessionCache(payload.userName).catch((error) => logger.error('Error clearing session cache', error));
            break;
        default:
            logger.error(`Unknown server event name: ${eventName}`, payload);
    }
}
//# sourceMappingURL=server-events.js.map