export function deepEqualArray(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0, len = a.length; i < len; i++) {
    if (!deepEqual(a[i], b[i])) return false;
  }

  return true;
}

export function deepEqual(a: any, b: any): boolean {
  // Check if both values are the same object/reference
  if (a === b) return true;

  // Check if both values are objects and not null
  if (typeof a === 'object' && a != null && typeof b === 'object' && b != null) {
    // Check if both values are arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      return deepEqualArray(a, b);
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    // Check if both objects have the same number of properties
    if (keysA.length !== keysB.length) return false;

    // Check each property of a to see if it's also in b
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // If neither value is an object or they are different objects, return false
  return false;
}
