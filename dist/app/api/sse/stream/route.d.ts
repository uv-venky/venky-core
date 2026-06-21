/**
 * SSE Stream Route
 *
 * Single endpoint for all SSE connections. Clients subscribe to channels
 * via query parameters and receive real-time updates.
 *
 * @example
 * ```typescript
 * // Client-side connection
 * const eventSource = new EventSource('/api/sse/stream?channels=workflow:abc,notification:user1');
 * ```
 */
export declare function GET(request: Request): Promise<Response>;
export declare const runtime = 'nodejs';
//# sourceMappingURL=route.d.ts.map
