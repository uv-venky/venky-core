/* Copyright (c) 2024-present Venky Corp. */
import { initVenkyApp } from '../../../lib/core/server/boot/init-app';
// Called only from the core proxy to initialize the server.
// Consuming apps use initVenkyApp directly from their own init.ts.
export async function init_CallThisOnlyFromCoreProxy() {
    await initVenkyApp({
        loadServerConfig: () => import('./server-config'),
        onAfterInit: async () => {
            const { registerAppSSEAuthorizers } = await import('./sse-authorizers');
            registerAppSSEAuthorizers();
        },
    });
}
//# sourceMappingURL=init.js.map