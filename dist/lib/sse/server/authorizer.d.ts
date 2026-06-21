/**
 * SSE Channel Authorizer
 *
 * Before a client is subscribed to a channel, the SSE stream route runs this
 * authorization layer so a session user cannot sniff arbitrary channels by
 * guessing ids (e.g. `custom:po-status:<guessed-uuid>`).
 *
 * Built-in rules:
 *  - `_system`                         — any authenticated user
 *  - `notification:<userName>`         — must match session userName exactly
 *  - `workflow:*`                      — workflow owner only
 *  - `execution:*`                     — owner of the backing workflow only
 *  - `data:*`                          — caller must have DataSource query access
 *  - `comment:*:*` / `custom:*`        — denied unless the app registered an
 *                                        authorizer via `registerChannelAuthorizer`
 *  - `job:status`                      — `admin` role only (Job Command Center live updates)
 *
 * Apps register per-prefix authorizers at boot. Channel names are matched by
 * longest-prefix wins.
 */
import type { Session } from '../../../auth';
export type ChannelAuthorizer = (channel: string, session: Session) => Promise<boolean> | boolean;
declare global {
    var _$sseChannelAuthorizers: Map<string, ChannelAuthorizer> | undefined;
}
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
export declare function registerChannelAuthorizer(prefix: string, fn: ChannelAuthorizer): void;
/**
 * Returns true if the session user is allowed to subscribe to the channel.
 */
export declare function authorizeSSEChannel(channel: string, session: Session): Promise<boolean>;
/**
 * Filters a list of requested channels to those the session is allowed to
 * subscribe to. Returns the allowed set and the denied set for logging.
 */
export declare function authorizeSSEChannels(channels: string[], session: Session): Promise<{
    allowed: string[];
    denied: string[];
}>;
//# sourceMappingURL=authorizer.d.ts.map