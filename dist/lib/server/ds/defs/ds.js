/* Copyright (c) 2024-present Venky Corp. */
import logger from '../../../../lib/core/server/logger';
import { DataSources as AllCoreDataSources } from './index';
const isDev = process.env.NODE_ENV === 'development';
if (!globalThis._$venkyDataSources) {
  const map = new Map();
  Object.entries(AllCoreDataSources).forEach(([id, ds]) => {
    map.set(id, ds);
  });
  globalThis._$venkyDataSources = map;
  globalThis._$venkyDataSourcesVersion = 0;
}
/**
 * Clears the DataSource cache and reloads core DataSources in dev mode.
 * This allows hot-reloading of DataSource definitions without server restart.
 */
export async function clearDataSourceCache() {
  const map = globalThis._$venkyDataSources;
  if (!map) return;
  // Clear ALL DataSources (both core and app)
  map.clear();
  globalThis._$venkyDataSourcesVersion = (globalThis._$venkyDataSourcesVersion ?? 0) + 1;
  // Reload core DataSources
  if (isDev) {
    // In dev mode, use dynamic import to get fresh modules.
    // Clear the CJS require cache first (only when running under a CJS-compatible runtime).
    // Vite dev SSR runs native ESM, so `require` may not exist — skip cache clearing there.
    if (typeof require !== 'undefined' && require.cache) {
      try {
        const coreModulePath = require.resolve('./core');
        const coreDir = coreModulePath.replace(/\/index\.(ts|js)$/, '');
        for (const key of Object.keys(require.cache)) {
          if (key.startsWith(coreDir)) {
            delete require.cache[key];
          }
        }
      } catch {
        // require.resolve may fail in ESM environments — safe to ignore
      }
    }
    // Re-import with fresh modules
    const freshCore = await import('./index');
    Object.entries(freshCore.DataSources).forEach(([id, ds]) => {
      map.set(id, ds);
    });
    logger.info(
      `[DS Hot Reload] Reloaded ${map.size} core DataSources (version ${globalThis._$venkyDataSourcesVersion})`,
    );
  } else {
    // In production, just restore from static import
    Object.entries(AllCoreDataSources).forEach(([id, ds]) => {
      map.set(id, ds);
    });
  }
}
/**
 * Adds DataSources to the global registry.
 * @param ds - Record of DataSource definitions to add
 * @param options - Options for adding DataSources
 * @param options.reload - If true, clears and reloads all DataSources (useful for dev mode hot-reload)
 */
export async function addDataSources(ds, options) {
  const map = globalThis._$venkyDataSources;
  if (!map) {
    throw new Error('Data sources not initialized');
  }
  // In dev mode with reload option, clear and reload all DataSources
  if (options?.reload) {
    await clearDataSourceCache();
    logger.info(`[DS Hot Reload] Reloading ${Object.keys(ds).length} app DataSources...`);
  } else {
    logger.info(`Adding ${Object.keys(ds).length} data sources to ${map.size} data sources`);
  }
  Object.entries(ds).forEach(([id, ds]) => {
    map.set(id, ds);
  });
  if (options?.reload) {
    logger.info(`[DS Hot Reload] Complete. Total DataSources: ${map.size}`);
  }
}
export function getDataSource(id) {
  const map = globalThis._$venkyDataSources;
  if (!map) {
    throw new Error('Data sources not initialized');
  }
  return map.get(id);
}
export function getAllDataSources() {
  const map = globalThis._$venkyDataSources;
  if (!map) {
    throw new Error('Data sources not initialized');
  }
  return Object.fromEntries(map.entries());
}
//# sourceMappingURL=ds.js.map
