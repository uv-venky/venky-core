import { proxy } from 'valtio';
import stringify from 'fast-json-stable-stringify';
export const queryStore = proxy({});
const MAX_ENTRIES = 100;
const usageOrder = new Map(); // keys in LRU order
function touchKey(key) {
    if (usageOrder.has(key))
        usageOrder.delete(key); // move to end
    usageOrder.set(key, true);
    if (usageOrder.size > MAX_ENTRIES) {
        const oldestKey = usageOrder.keys().next().value;
        if (oldestKey) {
            usageOrder.delete(oldestKey);
            delete queryStore[oldestKey];
        }
    }
}
export function updateUsage(key) {
    touchKey(key);
}
export function getCacheKey(name, args) {
    return `${name}:${stringify(args)}`;
}
/**
 * Invalidate a specific query cache entry.
 * Next useQuery call with same key will refetch.
 *
 * @example
 * invalidateQuery('getEntities'); // Invalidates all getEntities queries
 * invalidateQuery('getEntity', '123'); // Invalidates specific entity query
 */
export function invalidateQuery(actionName, ...params) {
    if (params.length === 0) {
        // Invalidate all queries for this action
        for (const key of Object.keys(queryStore)) {
            if (key.startsWith(`${actionName}:`)) {
                const entry = queryStore[key];
                if (entry) {
                    entry.invalidated = true;
                }
            }
        }
    }
    else {
        const cacheKey = getCacheKey(actionName, params);
        const entry = queryStore[cacheKey];
        if (entry) {
            entry.invalidated = true;
        }
    }
}
/**
 * Invalidate multiple queries by action names.
 *
 * @example
 * invalidateQueries(['getEntities', 'getEntityCount']);
 */
export function invalidateQueries(actionNames) {
    for (const actionName of actionNames) {
        invalidateQuery(actionName);
    }
}
/**
 * Invalidate all cached queries.
 * Use sparingly - typically after logout or major state changes.
 */
export function invalidateAllQueries() {
    // usageOrder.clear();
    for (const key of Object.keys(queryStore)) {
        const entry = queryStore[key];
        if (entry) {
            entry.invalidated = true;
        }
    }
}
/**
 * Check if a query is currently cached and successful.
 */
export function isQueryCached(actionName, ...params) {
    const cacheKey = params.length > 0 ? getCacheKey(actionName, params) : null;
    if (cacheKey) {
        return queryStore[cacheKey]?.status === 'success';
    }
    // Check if any query for this action is cached
    for (const key of Object.keys(queryStore)) {
        if (key.startsWith(`${actionName}:`) && queryStore[key]?.status === 'success') {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=valtioQueryStore.js.map