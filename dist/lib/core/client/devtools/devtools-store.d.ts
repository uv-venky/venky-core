import type { Env } from '../../../../venky-exports/core/ui';
import type { AppConfig } from '../../../../venky-exports/core/server';
export type ActivityType = 'query' | 'mutation' | 'store-query' | 'store-save' | 'store-invalidate' | 'cache-hit' | 'cache-invalidate' | 'network' | 'route-change';
export interface ActivityEntry {
    id: string;
    type: ActivityType;
    name: string;
    params?: unknown[];
    status: 'pending' | 'success' | 'error';
    /** ISO timestamp string */
    startedAt: string;
    /** ISO timestamp string */
    completedAt?: string;
    duration?: number;
    error?: string;
    result?: unknown;
}
export interface MutationEntry {
    id: string;
    name: string;
    params: unknown[];
    status: 'pending' | 'success' | 'error';
    /** ISO timestamp string */
    startedAt: string;
    /** ISO timestamp string */
    completedAt?: string;
    duration?: number;
    error?: string;
    result?: unknown;
    invalidatedQueries?: string[];
}
export interface StoreInfo {
    key: string;
    datasourceId: string;
    alias: string;
    page: string;
    rowCount: number;
    isLoading: boolean;
    isPosting: boolean;
    isDirty: boolean;
    dirtyRowCount: number;
    /** ISO timestamp string */
    lastQueryAt?: string;
    /** ISO timestamp string */
    lastSaveAt?: string;
    rows?: unknown[];
    query?: Record<string, unknown>;
}
export interface QueryInfo {
    key: string;
    actionName: string;
    params: unknown[];
    status: 'loading' | 'success' | 'error';
    /** ISO timestamp string */
    dataUpdatedAt?: string;
    error?: string;
    hasData: boolean;
}
export type NetworkType = 'api' | 'server-action' | 'ds' | 'query';
export interface NetworkEntry {
    id: string;
    /** ID of the corresponding activity entry for updates */
    activityId?: string;
    type: NetworkType;
    method: string;
    url: string;
    /** For server actions, the action name from Next-Action header */
    actionName?: string;
    status: 'pending' | 'success' | 'error';
    statusCode?: number;
    /** ISO timestamp string */
    startedAt: string;
    /** ISO timestamp string */
    completedAt?: string;
    duration?: number;
    requestHeaders?: Record<string, string>;
    requestBody?: unknown;
    responseHeaders?: Record<string, string>;
    responseBody?: unknown;
    responseSize?: number;
    error?: string;
}
export interface RouteEntry {
    id: string;
    from: string;
    to: string;
    /** ISO timestamp string */
    timestamp: string;
}
export type ErrorSource = 'unhandled' | 'query' | 'mutation' | 'network' | 'validation' | 'server' | 'custom';
export interface ErrorEntry {
    id: string;
    source: ErrorSource;
    message: string;
    stack?: string;
    /** ISO timestamp string */
    timestamp: string;
    context?: Record<string, unknown>;
    /** URL or action where error occurred */
    url?: string;
}
export interface EnvironmentInfo {
    nodeEnv: string;
    appVersion?: string;
    userName?: string;
    userEmail?: string;
    userRoles?: string[];
    pathname?: string;
    env?: Env;
}
/**
 * App config info for devtools display.
 * This should be sanitized by the caller to remove sensitive values.
 */
export type ConfigInfo = Omit<AppConfig, 'secret'>;
export type DevtoolsTab = 'stores' | 'queries' | 'mutations' | 'activity' | 'network' | 'errors' | 'config';
interface DevtoolsState {
    enabled: boolean;
    isOpen: boolean;
    activeTab: DevtoolsTab;
    filter: string;
    stores: Record<string, StoreInfo>;
    mutations: MutationEntry[];
    activity: ActivityEntry[];
    network: NetworkEntry[];
    routes: RouteEntry[];
    errors: ErrorEntry[];
    environment: EnvironmentInfo;
    config: ConfigInfo;
    maxActivityEntries: number;
    maxMutationEntries: number;
    maxNetworkEntries: number;
    maxErrorEntries: number;
    maxRouteEntries: number;
    /** Threshold in ms to highlight slow operations */
    slowThreshold: number;
}
export declare const devtoolsStore: DevtoolsState;
/**
 * Enable devtools (e.g., for admin users in production).
 * Call this when you detect a user with appropriate permissions.
 */
export declare function enableDevtools(): void;
/**
 * Disable devtools.
 */
export declare function disableDevtools(): void;
/**
 * Enable devtools if user has one of the specified roles.
 * @param userRoles - The roles the current user has
 * @param allowedRoles - Roles that allow devtools access (default: ['admin', 'app_admin'])
 */
export declare function enableDevtoolsForRoles(userRoles: string[], allowedRoles?: string[]): void;
/**
 * Set environment info for display in devtools.
 */
export declare function setEnvironmentInfo(info: Partial<EnvironmentInfo>): void;
/**
 * Set config info for display in devtools (sanitized - no secrets).
 */
export declare function setConfigInfo(info: Partial<ConfigInfo>): void;
/**
 * Set the current filter string.
 */
export declare function setFilter(filter: string): void;
/**
 * Set the slow operation threshold in ms.
 */
export declare function setSlowThreshold(ms: number): void;
export declare function logActivity(entry: Omit<ActivityEntry, 'id'>): string;
export declare function updateActivity(id: string, updates: Partial<ActivityEntry>): void;
export declare function logMutation(entry: Omit<MutationEntry, 'id'>): string;
export declare function updateMutation(id: string, updates: Partial<MutationEntry>): void;
export declare function registerStore(info: StoreInfo): void;
type StoreUpdateFields = Pick<StoreInfo, 'datasourceId' | 'alias' | 'page'> & Partial<Omit<StoreInfo, 'key' | 'datasourceId' | 'alias' | 'page'>>;
export declare function updateStore(key: string, updates: StoreUpdateFields): void;
export declare function unregisterStore(key: string): void;
export declare function logNetwork(entry: Omit<NetworkEntry, 'id' | 'activityId'>): string;
export declare function updateNetwork(id: string, updates: Partial<NetworkEntry>): void;
export declare function logRoute(from: string, to: string): void;
export declare function logError(source: ErrorSource, message: string, options?: {
    stack?: string;
    context?: Record<string, unknown>;
    url?: string;
}): string;
/**
 * Log an error from a caught exception.
 */
export declare function logException(error: unknown, source?: ErrorSource, context?: Record<string, unknown>): string;
export declare function openDevtools(): void;
export declare function closeDevtools(): void;
export declare function toggleDevtools(): void;
export declare function setActiveTab(tab: DevtoolsState['activeTab']): void;
export declare function clearActivity(): void;
export declare function clearMutations(): void;
export declare function clearStores(): void;
export declare function clearNetwork(): void;
export declare function clearRoutes(): void;
export declare function clearErrors(): void;
export declare function clearAll(): void;
/**
 * Export the current devtools state as a JSON file for debugging.
 * Includes all activity, mutations, stores, network requests, routes, errors, and environment info.
 */
export declare function exportDebugState(): void;
export declare function installFetchInterceptor(): void;
export declare function uninstallFetchInterceptor(): void;
export {};
//# sourceMappingURL=devtools-store.d.ts.map