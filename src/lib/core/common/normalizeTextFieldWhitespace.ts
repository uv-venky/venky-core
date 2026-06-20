/* Copyright (c) 2024-present Venky Corp. */

/** Leading/trailing trim; whitespace-only becomes undefined (aligns with isEmpty). */
export function normalizeTextFieldWhitespace(value: string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  const t = value.trim();
  return t === '' ? undefined : t;
}

/** For TextArray post: trim string elements only; preserve cardinality (empty string stays). */
export function normalizeTextArrayElementsForPost(arr: unknown[]): unknown[] {
  return arr.map((item) => (typeof item === 'string' ? item.trim() : item));
}
