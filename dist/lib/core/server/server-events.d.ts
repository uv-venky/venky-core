import type { PgPoolClient } from './db';
export type ServerEvent = {
  clearSessionCache: {
    userName: string;
  };
};
export type ServerEventName = keyof ServerEvent;
export type ServerEventPayload<T extends ServerEventName> = ServerEvent[T];
export declare function sendServerEvent<T extends ServerEventName>(
  client: PgPoolClient,
  eventName: T,
  payload: ServerEventPayload<T>,
): Promise<void>;
export declare function onServerEvent<T extends ServerEventName>(eventName: T, payload: ServerEventPayload<T>): void;
//# sourceMappingURL=server-events.d.ts.map
