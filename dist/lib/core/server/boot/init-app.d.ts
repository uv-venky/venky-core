import type { ServerConfig } from '../../../../lib/core/server/ServerConfig';
declare global {
  var _$initialized: boolean | undefined;
  var _$initPromise: Promise<void> | undefined;
}
export interface InitVenkyAppOptions {
  /** Dynamic import of ./server-config — keeps app config in the consuming project. */
  loadServerConfig: () => Promise<{
    default: ServerConfig;
  }>;
  /** Called after initializeServer (+ startup on first init) on first init and dev hot-reload. */
  onAfterInit?: () => void | Promise<void>;
  /** Optional one-time hooks after first init only (demo seeds, etc.). */
  onFirstInit?: () => void | Promise<void>;
  /** Result of require.resolve('../ds/defs') for dev app-DS hot-reload. */
  appDsDefsResolve?: string;
  /** Result of require.resolve('./server-config') — cleared with DS cache in dev. */
  serverConfigResolve?: string;
}
export declare function clearAppDataSourceCache(appDsDefsResolve: string, serverConfigResolve?: string): void;
/** Single-flight server init used by core and consuming apps. */
export declare function initVenkyApp(options: InitVenkyAppOptions): Promise<void>;
//# sourceMappingURL=init-app.d.ts.map
