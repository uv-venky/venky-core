import { type EnvironmentInfo, type ConfigInfo } from './devtools-store';
export declare function DevtoolsPanel(): import("react/jsx-runtime").JSX.Element | null;
/**
 * Floating toggle button for devtools.
 * Shows activity count badge when there are pending operations.
 *
 * @example
 * // Add to your layout
 * import { DevtoolsToggle } from '../../../../venky-exports/core/client/index.js';
 *
 * <DevtoolsToggle />
 */
export declare function DevtoolsToggle(): import("react/jsx-runtime").JSX.Element | null;
/**
 * Hook to track route changes in Next.js App Router.
 * Must be used within a component that has access to usePathname.
 */
export declare function useDevtoolsRouteTracking(pathname: string | null): void;
/**
 * Hook to set environment info in devtools.
 * Call this once in your layout with session/env data.
 */
export declare function useDevtoolsEnvironment(info: Partial<EnvironmentInfo>): void;
/**
 * Hook to set config info in devtools.
 * Call this once in your layout after fetching server config.
 */
export declare function useDevtoolsConfig(info: Partial<ConfigInfo>): void;
/**
 * Devtools component - renders the devtools panel.
 * Open via user menu "Debug Console" or keyboard shortcut ⌘⇧D.
 *
 * @example
 * // Add to your root layout
 * import { Devtools } from '../../../../venky-exports/core/client/index.js';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <Devtools />
 *     </>
 *   );
 * }
 */
export declare function Devtools(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DevtoolsPanel.d.ts.map