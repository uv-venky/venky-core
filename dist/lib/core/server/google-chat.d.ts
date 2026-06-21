/**
 * Send an alert message to a Google Chat space via webhook.
 * Fire-and-forget — errors are logged but never thrown.
 */
export declare function sendGoogleChatAlert(text: string): void;
/** Common footer appended to all operational alerts. */
export declare function alertFooter(): string;
/** Extended info block for startup/shutdown alerts only. */
export declare function serverInfoBlock(): Promise<string>;
//# sourceMappingURL=google-chat.d.ts.map
