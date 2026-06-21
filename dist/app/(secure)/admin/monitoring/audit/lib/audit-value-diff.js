/* Copyright (c) 2024-present Venky Corp. */
import { format } from 'date-fns';
export function getAuditRawValue(data, isOld) {
  switch (data.valueType) {
    case 'String':
      return isOld ? data.oldStringValue : data.newStringValue;
    case 'Number':
      return isOld ? data.oldDoubleValue : data.newDoubleValue;
    case 'Date': {
      const dateValue = isOld ? data.oldDatetimeValue : data.newDatetimeValue;
      return dateValue ? format(new Date(dateValue), 'PPpp') : null;
    }
    case 'JSON':
    case 'CLOB':
      return isOld ? data.oldClobValue : data.newClobValue;
    default:
      return isOld ? data.oldStringValue : data.newStringValue;
  }
}
export function getAuditChangeType(data) {
  const oldValue = getAuditRawValue(data, true);
  const newValue = getAuditRawValue(data, false);
  if (oldValue === null && newValue !== null) {
    return 'added';
  }
  if (oldValue !== null && newValue === null) {
    return 'removed';
  }
  if (data.attributeCode === 'activeFlag' && newValue === 'N') {
    return 'deactivated';
  }
  if (data.attributeCode === 'activeFlag' && newValue === 'Y') {
    return 'activated';
  }
  return 'modified';
}
function tryPrettyJson(text) {
  const trimmed = text.trim();
  if (trimmed === '') {
    return '';
  }
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return text;
  }
}
export function formatAuditValueForDiff(value, valueType) {
  if (value == null) {
    return '';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  const text = String(value);
  if (valueType === 'JSON') {
    return tryPrettyJson(text);
  }
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return tryPrettyJson(text);
  }
  return text;
}
export function getAuditDiffTexts(data) {
  const valueType = data.valueType;
  const oldText = formatAuditValueForDiff(getAuditRawValue(data, true), valueType);
  const newText = formatAuditValueForDiff(getAuditRawValue(data, false), valueType);
  const useJson =
    valueType === 'JSON' ||
    oldText.trim().startsWith('{') ||
    oldText.trim().startsWith('[') ||
    newText.trim().startsWith('{') ||
    newText.trim().startsWith('[');
  return {
    oldText,
    newText,
    language: useJson ? 'json' : 'plaintext',
  };
}
export function canShowAuditValueDiff(data) {
  if (data.valueType === 'Date') {
    return false;
  }
  const { oldText, newText } = getAuditDiffTexts(data);
  if (oldText === '' && newText === '') {
    return false;
  }
  return oldText !== newText;
}
//# sourceMappingURL=audit-value-diff.js.map
