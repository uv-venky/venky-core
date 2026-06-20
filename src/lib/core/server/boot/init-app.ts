/* Copyright (c) 2024-present Venky Corp. */

import type { ServerConfig } from '@/lib/core/server/ServerConfig';

declare global {
  var _$initialized: boolean | undefined;
  var _$initPromise: Promise<void> | undefined;
}

export interface InitVenkyAppOptions {
  /** Dynamic import of ./server-config — keeps app config in the consuming project. */
  loadServerConfig: () => Promise<{ default: ServerConfig }>;
  /** Called after initializeServer (+ startup on first init) on first init and dev hot-reload. */
  onAfterInit?: () => void | Promise<void>;
  /** Optional one-time hooks after first init only (demo seeds, etc.). */
  onFirstInit?: () => void | Promise<void>;
  /** Result of require.resolve('../ds/defs') for dev app-DS hot-reload. */
  appDsDefsResolve?: string;
  /** Result of require.resolve('./server-config') — cleared with DS cache in dev. */
  serverConfigResolve?: string;
}

export function clearAppDataSourceCache(appDsDefsResolve: string, serverConfigResolve?: string): void {
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
export async function initVenkyApp(options: InitVenkyAppOptions): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development';
  const { loadServerConfig, onAfterInit, onFirstInit, appDsDefsResolve, serverConfigResolve } = options;

  if (globalThis._$initialized) {
    if (isDev) {
      if (appDsDefsResolve) {
        clearAppDataSourceCache(appDsDefsResolve, serverConfigResolve);
      }
      const config = await loadServerConfig();
      const { initializeServer } = await import('@/lib/core/server/Server');
      await initializeServer(config.default);
      await onAfterInit?.();
    }
    return;
  }

  if (globalThis._$initPromise) {
    await globalThis._$initPromise;
    return;
  }

  let resolveInit: () => void = () => {};
  globalThis._$initPromise = new Promise<void>((resolve) => {
    resolveInit = resolve;
  });

  try {
    globalThis._$initialized = true;
    const startTime = Date.now();
    const logger = (await import('@/lib/core/server/logger')).default;
    logger.info('Initializing server...');

    const config = await loadServerConfig();
    const { initializeServer } = await import('@/lib/core/server/Server');
    await initializeServer(config.default);

    const startupModule = await import('@/lib/core/server/startup');
    await startupModule.default();

    await onAfterInit?.();
    logger.info(`Server initialized in ${Date.now() - startTime}ms`);
    await onFirstInit?.();
  } finally {
    globalThis._$initPromise = undefined;
    resolveInit();
  }
}
