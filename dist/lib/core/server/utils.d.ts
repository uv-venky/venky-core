/**
 * Resolve the public-facing origin from a request, respecting proxy headers
 * (X-Forwarded-Proto, X-Forwarded-Host) set by ALB / reverse proxies.
 * Falls back to the URL's own origin for local dev.
 */
export declare function getRequestOrigin(req: {
    url: string;
    headers: Headers;
}): string;
export declare function getValidIpAddress(headers: Headers): string;
export interface DBUserActive {
    start_date: Date;
    end_date?: Date;
    locked: boolean;
}
export declare function isUserActiveSync(user: DBUserActive): boolean;
//# sourceMappingURL=utils.d.ts.map