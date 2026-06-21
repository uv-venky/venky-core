/**
 * Job entry point: write one current sample, recover any leftover crash
 * dumps, and (every Nth run) prune rows older than RETENTION_DAYS.
 *
 * Uses a dedicated short-lived connection (newClient + finally release)
 * rather than the long-held `transaction` wrapper so a slow prune query
 * can't pin a pool slot.
 */
export declare function sampleMemory(): Promise<void>;
/**
 * One-shot boot sample written with sample_kind='startup'. Called from server
 * startup so every process restart leaves a marker row and the boot baseline
 * boot baseline shows up in trends immediately (the periodic job won't fire
 * for up to 5 minutes after boot). Failures are swallowed — we never want
 * sampling to block or break startup.
 */
export declare function recordStartupSample(): Promise<void>;
//# sourceMappingURL=memory-sampler.d.ts.map