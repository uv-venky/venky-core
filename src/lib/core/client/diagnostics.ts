'use client';

/** No-op log sink (feedback module removed). Kept for client logger/store compatibility. */
export function pushLog(_level: string, _props: Record<string, unknown>): void {}
