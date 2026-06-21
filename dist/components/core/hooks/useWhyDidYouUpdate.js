/* Copyright (c) 2024-present VENKY Corp. */
import { useEffect, useMemo, useRef } from 'react';
import CONSTANTS from '../../../lib/core/client/constants';
// Maximum depth to recurse into objects
const MAX_DEPTH = 5;
/**
 * Formats a value for display in the console
 */
function formatValue(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return '[Function]';
  if (typeof value === 'symbol') return value.toString();
  if (value && typeof value === 'object' && '$$typeof' in value) {
    return '[ReactElement]';
  }
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value);
      return str.length > 100 ? `${str.slice(0, 100)}...` : str;
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}
/**
 * Checks if a value is a plain object (not array, null, or special object)
 */
function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
/**
 * Recursively finds all changed paths between two values
 */
function getChangedPaths(prev, curr, basePath, depth) {
  // If they're the same reference, no changes
  if (prev === curr) return [];
  // If we've hit max depth, just report this path changed
  if (depth >= MAX_DEPTH) {
    return [{ path: basePath, from: prev, to: curr }];
  }
  // Handle null/undefined
  if (prev === null || prev === undefined || curr === null || curr === undefined) {
    return [{ path: basePath, from: prev, to: curr }];
  }
  // Handle functions - just report they changed
  if (typeof prev === 'function' || typeof curr === 'function') {
    return [{ path: basePath, from: prev, to: curr }];
  }
  // Handle React elements - just report they changed
  if ((typeof prev === 'object' && '$$typeof' in prev) || (typeof curr === 'object' && '$$typeof' in curr)) {
    return [{ path: basePath, from: prev, to: curr }];
  }
  // Handle arrays
  if (Array.isArray(prev) || Array.isArray(curr)) {
    if (!Array.isArray(prev) || !Array.isArray(curr)) {
      return [{ path: basePath, from: prev, to: curr }];
    }
    const changes = [];
    const maxLength = Math.max(prev.length, curr.length);
    // If lengths differ significantly, just report the array changed
    if (Math.abs(prev.length - curr.length) > 10) {
      return [{ path: `${basePath}.length`, from: prev.length, to: curr.length }];
    }
    for (let i = 0; i < maxLength; i++) {
      const itemPath = `${basePath}[${i}]`;
      if (i >= prev.length) {
        changes.push({ path: itemPath, from: undefined, to: curr[i] });
      } else if (i >= curr.length) {
        changes.push({ path: itemPath, from: prev[i], to: undefined });
      } else if (prev[i] !== curr[i]) {
        changes.push(...getChangedPaths(prev[i], curr[i], itemPath, depth + 1));
      }
    }
    return changes;
  }
  // Handle plain objects
  if (isPlainObject(prev) && isPlainObject(curr)) {
    const changes = [];
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
    for (const key of allKeys) {
      const keyPath = basePath ? `${basePath}.${key}` : key;
      const prevVal = prev[key];
      const currVal = curr[key];
      if (prevVal !== currVal) {
        changes.push(...getChangedPaths(prevVal, currVal, keyPath, depth + 1));
      }
    }
    return changes;
  }
  // For primitives or other objects, just report the change
  return [{ path: basePath, from: prev, to: curr }];
}
/**
 * A hook that logs changes to React props that gets changed between renders.
 * Shows nested paths that changed within object props.
 * @param name Component Name
 * @param props An object with the component props to be compared
 * @param printKeysOnly If true, only the keys that changed will be printed. If false, will print along with the values.
 */
export default function useWhyDidYouUpdate(name, props, printKeysOnly = false) {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef(null);
  const enabled = CONSTANTS.whyDidYouUpdateEnabled;
  const componentNames = useMemo(() => CONSTANTS.whyDidYouUpdateNames, []);
  useEffect(() => {
    if (!enabled || !componentNames.includes(name)) {
      return;
    }
    console.info('%c[why-did-you-update]', 'color: gray;', `[${name}] mounted!`);
    return () => {
      console.info('%c[why-did-you-update]', 'color: gray;', `[${name}] unmounted!`);
    };
  }, [name, enabled, componentNames]);
  useEffect(() => {
    if (!enabled || !componentNames.includes(name)) {
      return;
    }
    const prev = previousProps.current;
    if (prev) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...prev, ...props });
      // Track changes per prop
      const changesObj = {};
      const changedKeys = [];
      // Iterate through keys
      for (const key of allKeys) {
        // If previous is different from current
        if (prev[key] !== props[key]) {
          if (printKeysOnly) {
            changedKeys.push(key);
          } else {
            // Get nested changes for this prop
            const nestedChanges = getChangedPaths(prev[key], props[key], key, 0);
            if (nestedChanges.length === 1 && nestedChanges[0].path === key) {
              // Single top-level change
              changesObj[key] = {
                from: formatValue(nestedChanges[0].from),
                to: formatValue(nestedChanges[0].to),
              };
            } else if (nestedChanges.length > 0) {
              // Multiple nested changes - group them
              changesObj[key] = {
                changedPaths: nestedChanges.map((c) => ({
                  path: c.path,
                  from: formatValue(c.from),
                  to: formatValue(c.to),
                })),
              };
            }
          }
        }
      }
      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length || changedKeys.length) {
        console.info('%c[why-did-you-update]', 'color: gray;', `[${name}]`, printKeysOnly ? changedKeys : changesObj);
      } else {
        console.info('%c[why-did-you-update]', 'color: gray;', `[${name}]`, 'no changes!');
      }
    }
    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  }, [name, props, printKeysOnly, enabled, componentNames]);
}
//# sourceMappingURL=useWhyDidYouUpdate.js.map
