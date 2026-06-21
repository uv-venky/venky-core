/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { proxy, ref } from 'valtio';
const DEVTOOLS_OPEN_STORAGE_KEY = 'venky-devtools-open';
function getInitialOpenState() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DEVTOOLS_OPEN_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
export const devtoolsStore = proxy({
  enabled: process.env.NODE_ENV === 'development',
  isOpen: getInitialOpenState(),
  activeTab: 'activity',
  filter: '',
  stores: {},
  mutations: [],
  activity: [],
  network: [],
  routes: [],
  errors: [],
  environment: {
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  config: {},
  maxActivityEntries: 100,
  maxMutationEntries: 50,
  maxNetworkEntries: 100,
  maxRouteEntries: 50,
  maxErrorEntries: 100,
  slowThreshold: 500,
});
let activityIdCounter = 0;
/**
 * Enable devtools (e.g., for admin users in production).
 * Call this when you detect a user with appropriate permissions.
 */
export function enableDevtools() {
  devtoolsStore.enabled = true;
}
/**
 * Disable devtools.
 */
export function disableDevtools() {
  devtoolsStore.enabled = false;
  devtoolsStore.isOpen = false;
}
/**
 * Enable devtools if user has one of the specified roles.
 * @param userRoles - The roles the current user has
 * @param allowedRoles - Roles that allow devtools access (default: ['admin', 'app_admin'])
 */
export function enableDevtoolsForRoles(userRoles, allowedRoles = ['admin', 'app_admin']) {
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));
  if (hasAccess) {
    devtoolsStore.enabled = true;
  }
}
/**
 * Set environment info for display in devtools.
 */
export function setEnvironmentInfo(info) {
  Object.assign(devtoolsStore.environment, info);
}
/**
 * Set config info for display in devtools (sanitized - no secrets).
 */
export function setConfigInfo(info) {
  Object.assign(devtoolsStore.config, info);
}
/**
 * Set the current filter string.
 */
export function setFilter(filter) {
  devtoolsStore.filter = filter;
}
/**
 * Set the slow operation threshold in ms.
 */
export function setSlowThreshold(ms) {
  devtoolsStore.slowThreshold = ms;
}
function generateId() {
  return `${Date.now()}-${++activityIdCounter}`;
}
/** Get current timestamp as ISO string for human-readable JSON export */
function now() {
  return new Date().toISOString();
}
/** Calculate duration in ms between two ISO timestamps */
function calcDuration(start, end) {
  return new Date(end).getTime() - new Date(start).getTime();
}
// Activity tracking
export function logActivity(entry) {
  if (!devtoolsStore.enabled) return '';
  const id = generateId();
  const fullEntry = { ...entry, id };
  devtoolsStore.activity.unshift(ref(fullEntry));
  // Trim old completed entries (never remove pending ones)
  while (devtoolsStore.activity.length > devtoolsStore.maxActivityEntries) {
    const lastCompletedIndex = devtoolsStore.activity.findLastIndex((a) => a.status !== 'pending');
    if (lastCompletedIndex !== -1) {
      devtoolsStore.activity.splice(lastCompletedIndex, 1);
    } else {
      break;
    }
  }
  return id;
}
export function updateActivity(id, updates) {
  if (!devtoolsStore.enabled || !id) return;
  const index = devtoolsStore.activity.findIndex((a) => a.id === id);
  if (index !== -1) {
    const entry = devtoolsStore.activity[index];
    // Only apply defined values (don't let undefined overwrite existing values)
    const definedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        definedUpdates[key] = value;
      }
    }
    devtoolsStore.activity[index] = ref({
      ...entry,
      ...definedUpdates,
      duration: updates.completedAt ? calcDuration(entry.startedAt, updates.completedAt) : entry.duration,
    });
  }
}
// Mutation tracking
export function logMutation(entry) {
  if (!devtoolsStore.enabled) return '';
  const id = generateId();
  const fullEntry = { ...entry, id };
  devtoolsStore.mutations.unshift(ref(fullEntry));
  // Trim old completed entries (never remove pending ones)
  while (devtoolsStore.mutations.length > devtoolsStore.maxMutationEntries) {
    const lastCompletedIndex = devtoolsStore.mutations.findLastIndex((m) => m.status !== 'pending');
    if (lastCompletedIndex !== -1) {
      devtoolsStore.mutations.splice(lastCompletedIndex, 1);
    } else {
      break;
    }
  }
  // Also log to activity
  logActivity({
    type: 'mutation',
    name: entry.name,
    params: entry.params,
    status: entry.status,
    startedAt: entry.startedAt,
  });
  return id;
}
export function updateMutation(id, updates) {
  if (!devtoolsStore.enabled || !id) return;
  const index = devtoolsStore.mutations.findIndex((m) => m.id === id);
  if (index !== -1) {
    const entry = devtoolsStore.mutations[index];
    devtoolsStore.mutations[index] = ref({
      ...entry,
      ...updates,
      duration: updates.completedAt ? calcDuration(entry.startedAt, updates.completedAt) : entry.duration,
    });
  }
  // Update activity too
  updateActivity(id, {
    status: updates.status,
    completedAt: updates.completedAt,
    error: updates.error,
    result: updates.result,
  });
}
// Store tracking
export function registerStore(info) {
  if (!devtoolsStore.enabled) return;
  devtoolsStore.stores[info.key] = ref(info);
}
export function updateStore(key, updates) {
  if (!devtoolsStore.enabled) return;
  const existing = devtoolsStore.stores[key];
  if (existing) {
    devtoolsStore.stores[key] = ref({ ...existing, ...updates });
  } else {
    // Re-register store if it was cleared but still active
    devtoolsStore.stores[key] = ref({
      key,
      rowCount: 0,
      isLoading: false,
      isPosting: false,
      isDirty: false,
      dirtyRowCount: 0,
      ...updates,
    });
  }
}
export function unregisterStore(key) {
  if (!devtoolsStore.enabled) return;
  delete devtoolsStore.stores[key];
}
// Network tracking
export function logNetwork(entry) {
  if (!devtoolsStore.enabled) return '';
  // Log to activity first to get the activity ID
  const activityId = logActivity({
    type: 'network',
    name: `${entry.method} ${entry.url}`,
    status: entry.status,
    startedAt: entry.startedAt,
  });
  const id = generateId();
  const fullEntry = { ...entry, id, activityId };
  devtoolsStore.network.unshift(ref(fullEntry));
  // Trim old completed entries (never remove pending ones)
  while (devtoolsStore.network.length > devtoolsStore.maxNetworkEntries) {
    // Find the oldest completed entry to remove
    const lastCompletedIndex = devtoolsStore.network.findLastIndex((n) => n.status !== 'pending');
    if (lastCompletedIndex !== -1) {
      devtoolsStore.network.splice(lastCompletedIndex, 1);
    } else {
      // All entries are pending, can't trim safely
      break;
    }
  }
  return id;
}
export function updateNetwork(id, updates) {
  if (!devtoolsStore.enabled || !id) return;
  const index = devtoolsStore.network.findIndex((n) => n.id === id);
  if (index === -1) return;
  const entry = devtoolsStore.network[index];
  if (!entry) return;
  devtoolsStore.network[index] = ref({
    ...entry,
    ...updates,
    duration: updates.completedAt ? calcDuration(entry.startedAt, updates.completedAt) : entry.duration,
  });
  // Update corresponding activity entry by ID (not by name - name isn't unique!)
  if (entry.activityId) {
    updateActivity(entry.activityId, {
      status: updates.status,
      completedAt: updates.completedAt,
      error: updates.error,
    });
  }
}
// Route tracking
export function logRoute(from, to) {
  if (!devtoolsStore.enabled) return;
  const id = generateId();
  const timestamp = now();
  const entry = { id, from, to, timestamp };
  devtoolsStore.routes.unshift(ref(entry));
  // Trim old entries
  if (devtoolsStore.routes.length > devtoolsStore.maxRouteEntries) {
    devtoolsStore.routes.pop();
  }
  // Update current pathname
  devtoolsStore.environment.pathname = to;
  // Also log to activity
  logActivity({
    type: 'route-change',
    name: `${from} → ${to}`,
    status: 'success',
    startedAt: timestamp,
    completedAt: timestamp,
    duration: 0,
  });
}
// Error tracking
export function logError(source, message, options) {
  if (!devtoolsStore.enabled) return '';
  const id = generateId();
  const timestamp = now();
  const entry = {
    id,
    source,
    message,
    stack: options?.stack,
    context: options?.context,
    url: options?.url ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    timestamp,
  };
  devtoolsStore.errors.unshift(ref(entry));
  // Trim old entries
  if (devtoolsStore.errors.length > devtoolsStore.maxErrorEntries) {
    devtoolsStore.errors.pop();
  }
  // Also log to activity
  logActivity({
    type: 'query', // Use query type for errors in activity (shows as error status)
    name: `[${source}] ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
    status: 'error',
    startedAt: timestamp,
    completedAt: timestamp,
    duration: 0,
    error: message,
  });
  return id;
}
/**
 * Log an error from a caught exception.
 */
export function logException(error, source = 'unhandled', context) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  return logError(source, message, { stack, context });
}
// Devtools controls
function saveOpenState(isOpen) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DEVTOOLS_OPEN_STORAGE_KEY, String(isOpen));
    } catch {
      // Ignore storage errors
    }
  }
}
export function openDevtools() {
  devtoolsStore.isOpen = true;
  saveOpenState(true);
}
export function closeDevtools() {
  devtoolsStore.isOpen = false;
  saveOpenState(false);
}
export function toggleDevtools() {
  const newState = !devtoolsStore.isOpen;
  devtoolsStore.isOpen = newState;
  saveOpenState(newState);
}
export function setActiveTab(tab) {
  devtoolsStore.activeTab = tab;
}
export function clearActivity() {
  devtoolsStore.activity = [];
}
export function clearMutations() {
  devtoolsStore.mutations = [];
}
export function clearStores() {
  devtoolsStore.stores = {};
}
export function clearNetwork() {
  devtoolsStore.network = [];
}
export function clearRoutes() {
  devtoolsStore.routes = [];
}
export function clearErrors() {
  devtoolsStore.errors = [];
}
export function clearAll() {
  clearActivity();
  clearMutations();
  clearStores();
  clearNetwork();
  clearRoutes();
  clearErrors();
}
/**
 * Export the current devtools state as a JSON file for debugging.
 * Includes all activity, mutations, stores, network requests, routes, errors, and environment info.
 */
export function exportDebugState() {
  const state = {
    exportedAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    environment: { ...devtoolsStore.environment },
    activity: [...devtoolsStore.activity],
    mutations: [...devtoolsStore.mutations],
    stores: { ...devtoolsStore.stores },
    network: [...devtoolsStore.network],
    routes: [...devtoolsStore.routes],
    errors: [...devtoolsStore.errors],
    config: { ...devtoolsStore.config },
  };
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venky-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
// Fetch interceptor for automatic network tracking
let originalFetch = null;
export function installFetchInterceptor() {
  if (typeof window === 'undefined' || originalFetch) return;
  originalFetch = window.fetch;
  window.fetch = async function interceptedFetch(input, init) {
    // originalFetch is guaranteed to be set at this point since we check in installFetchInterceptor
    const fetchFn = originalFetch;
    if (!devtoolsStore.enabled) {
      return fetchFn(input, init);
    }
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET');
    // Helper to get header value (case-insensitive)
    const headers = init?.headers;
    const getHeader = (name) => {
      const lowerName = name.toLowerCase();
      if (headers instanceof Headers) {
        return headers.get(name) ?? undefined;
      }
      if (Array.isArray(headers)) {
        const found = headers.find(([key]) => key.toLowerCase() === lowerName);
        return found?.[1];
      }
      if (headers && typeof headers === 'object') {
        // Check both exact case and lowercase
        const record = headers;
        return (
          record[name] ?? record[lowerName] ?? Object.entries(record).find(([k]) => k.toLowerCase() === lowerName)?.[1]
        );
      }
      return undefined;
    };
    // Detect server actions by Next-Action header or RSC content type
    const nextActionHeader = getHeader('Next-Action');
    const acceptHeader = getHeader('Accept');
    const contentTypeHeader = getHeader('Content-Type');
    const isServerAction =
      nextActionHeader !== undefined ||
      acceptHeader?.includes('text/x-component') ||
      contentTypeHeader?.includes('text/x-component');
    // Only log API routes (/api/*) and Next.js server actions
    const urlPath = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0];
    const isApiRoute = urlPath.startsWith('/api/');
    const shouldLog = isApiRoute || isServerAction;
    let networkType = isServerAction ? 'server-action' : 'api';
    if (urlPath.startsWith('/api/ds') || urlPath.startsWith('/api/attributes')) {
      networkType = 'ds';
    }
    if (urlPath.startsWith('/api/action')) {
      networkType = 'query';
    }
    if (!shouldLog) {
      return fetchFn(input, init);
    }
    // Use Next-Action header as action name if available
    const actionName = nextActionHeader;
    const startedAt = now();
    let requestBody;
    try {
      if (init?.body && typeof init.body === 'string') {
        requestBody = JSON.parse(init.body);
      }
    } catch {
      requestBody = init?.body;
    }
    const networkId = logNetwork({
      type: networkType,
      method: method.toUpperCase(),
      url: isServerAction ? urlPath : url,
      actionName,
      status: 'pending',
      startedAt,
      requestBody,
    });
    try {
      const response = await fetchFn(input, init);
      const completedAt = now();
      // Update network entry immediately with status (don't wait for body parsing)
      updateNetwork(networkId, {
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        completedAt,
      });
      // Parse response body async (non-blocking) for API routes only
      if (!isServerAction) {
        // Don't await - let body parsing happen in background
        void (async () => {
          try {
            const clonedResponse = response.clone();
            const text = await clonedResponse.text();
            const responseSize = text.length;
            let responseBody;
            try {
              responseBody = JSON.parse(text);
            } catch {
              responseBody = text.slice(0, 500); // Truncate large text responses
            }
            // Update with body data
            updateNetwork(networkId, { responseBody, responseSize });
          } catch {
            // Ignore body reading errors
          }
        })();
      }
      return response;
    } catch (error) {
      updateNetwork(networkId, {
        status: 'error',
        completedAt: now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };
}
export function uninstallFetchInterceptor() {
  if (typeof window === 'undefined' || !originalFetch) return;
  window.fetch = originalFetch;
  originalFetch = null;
}
// Keyboard shortcut (Ctrl+Shift+D or Cmd+Shift+D)
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      toggleDevtools();
    }
  });
}
//# sourceMappingURL=devtools-store.js.map
