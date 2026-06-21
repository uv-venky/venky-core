/* Copyright (c) 2024-present Venky Corp. */
export function clearAppDataSourceCache(appDsDefsResolve, serverConfigResolve) {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    const dsDefsDir = appDsDefsResolve.replace(/\/index\.(ts|js)$/, '');
    for (const key of Object.keys(require.cache)) {
        if (key.startsWith(dsDefsDir)) {
            delete require.cache[key];
        }
    }
    if (serverConfigResolve) {
        delete require.cache[serverConfigResolve];
    }
}
/** Single-flight server init used by core and consuming apps. */
export async function initVenkyApp(options) {
    const isDev = process.env.NODE_ENV === 'development';
    const { loadServerConfig, onAfterInit, onFirstInit, appDsDefsResolve, serverConfigResolve } = options;
    if (globalThis._$initialized) {
        if (isDev) {
            if (appDsDefsResolve) {
                clearAppDataSourceCache(appDsDefsResolve, serverConfigResolve);
            }
            const config = await loadServerConfig();
            const { initializeServer } = await import('../../../../lib/core/server/Server');
            await initializeServer(config.default);
            await onAfterInit?.();
        }
        return;
    }
    if (globalThis._$initPromise) {
        await globalThis._$initPromise;
        return;
    }
    let resolveInit = () => { };
    globalThis._$initPromise = new Promise((resolve) => {
        resolveInit = resolve;
    });
    try {
        globalThis._$initialized = true;
        const startTime = Date.now();
        const logger = (await import('../../../../lib/core/server/logger')).default;
        logger.info('Initializing server...');
        const config = await loadServerConfig();
        const { initializeServer } = await import('../../../../lib/core/server/Server');
        await initializeServer(config.default);
        const startupModule = await import('../../../../lib/core/server/startup');
        await startupModule.default();
        await onAfterInit?.();
        logger.info(`Server initialized in ${Date.now() - startTime}ms`);
        await onFirstInit?.();
    }
    finally {
        globalThis._$initPromise = undefined;
        resolveInit();
    }
}
//# sourceMappingURL=init-app.js.map