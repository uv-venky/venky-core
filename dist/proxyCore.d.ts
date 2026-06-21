import type { NextRequest } from 'next/server';
export interface ProxyCoreOptions {
  /** Allowed hostnames (e.g. ['work.venky.local', 'feedback.venky.local']). Requests with other Host headers are rejected. */
  allowedHosts?: string[];
}
export declare function proxyCore(req: NextRequest, options?: ProxyCoreOptions): Promise<Response>;
//# sourceMappingURL=proxyCore.d.ts.map
