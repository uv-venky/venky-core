interface SessionTrackerApi {
    updateSessionAccess(sessionId: string, expiresAt: string): void;
    shutdown(): Promise<void>;
    getStats(): {
        totalSessions: number;
        sessionsNeedingUpdate: number;
    };
}
declare global {
    var _$sessionTracker: SessionTrackerApi | undefined;
    var _$isShuttingDown: boolean | undefined;
}
export declare const sessionTracker: SessionTrackerApi;
export {};
//# sourceMappingURL=session-tracker.d.ts.map