/* Copyright (c) 2024-present Venky Corp. */

import { format } from 'date-fns';
import type { AuditValueType } from '@/lib/common/ds/types/core/Audit';

export type AuditChangeType = 'added' | 'removed' | 'modified' | 'activated' | 'deactivated';

export interface AuditRowValueData {
  valueType?: AuditValueType | string;
  oldStringValue?: string | null;
  newStringValue?: string | null;
  oldDoubleValue?: number | null;
  newDoubleValue?: number | null;
  oldDatetimeValue?: string | null;
  newDatetimeValue?: string | null;
  oldClobValue?: string | null;
  newClobValue?: string | null;
  attributeCode?: string;
}

export function getAuditRawValue(data: AuditRowValueData, isOld: boolean): unknown {
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

export function getAuditChangeType(data: AuditRowValueData): AuditChangeType {
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

function tryPrettyJson(text: string): string {
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

export function formatAuditValueForDiff(value: unknown, valueType?: string): string {
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

export function getAuditDiffTexts(data: AuditRowValueData): {
  oldText: string;
  newText: string;
  language: 'json' | 'plaintext';
} {
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

export function canShowAuditValueDiff(data: AuditRowValueData): boolean {
  if (data.valueType === 'Date') {
    return false;
  }
  const { oldText, newText } = getAuditDiffTexts(data);
  if (oldText === '' && newText === '') {
    return false;
  }
  return oldText !== newText;
}
