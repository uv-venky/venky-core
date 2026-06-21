/**
 * Hook to detect when a new version of the app has been deployed
 *
 * Uses SSE to listen for version updates from the server. When the server
 * sends a version message that differs from the client version, it means
 * a new version has been deployed.
 *
 * @returns Object with `hasNewVersion` boolean and `currentVersion` string
 */
export declare function useVersionCheck(): {
    hasNewVersion: boolean;
    clientVersion: string;
    serverVersion: string | null;
};
//# sourceMappingURL=use-version-check.d.ts.map