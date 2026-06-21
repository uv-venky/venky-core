/* Copyright (c) 2023-present Venky Corp. */
export function isSelectLookupColumn(column) {
  return column.type === 'Select' && 'lookupType' in column;
}
export function isSelectOptionsColumn(column) {
  return column.type === 'Select' && !('lookupType' in column);
}
//# sourceMappingURL=types.js.map
