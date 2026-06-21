/* Copyright (c) 2024-present Venky Corp. */
/** Leading/trailing trim; whitespace-only becomes undefined (aligns with isEmpty). */
export function normalizeTextFieldWhitespace(value) {
  if (value == null) {
    return undefined;
  }
  const t = value.trim();
  return t === '' ? undefined : t;
}
/** For TextArray post: trim string elements only; preserve cardinality (empty string stays). */
export function normalizeTextArrayElementsForPost(arr) {
  return arr.map((item) => (typeof item === 'string' ? item.trim() : item));
}
//# sourceMappingURL=normalizeTextFieldWhitespace.js.map
