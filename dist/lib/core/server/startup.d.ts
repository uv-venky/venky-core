declare global {
  var _$startupPromise: Promise<void> | undefined;
  var _$startupResolve: (() => void) | undefined;
  var _$startupComplete: boolean | undefined;
}
/**
 * Wait for server startup to complete.
 * This is used by auth() to wait for the auto-login session to be cached
 * before processing requests when AUTO_LOGIN_USER is set.
 */
export declare function waitForStartup(): Promise<void>;
export default function startup(): Promise<void>;
//# sourceMappingURL=startup.d.ts.map
