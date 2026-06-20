/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, test } from 'vitest';
import {
  canShowAuditValueDiff,
  formatAuditValueForDiff,
  getAuditDiffTexts,
} from '@/app/(secure)/admin/monitoring/audit/lib/audit-value-diff';

describe('audit-value-diff', () => {
  test('pretty-prints JSON values', () => {
    const formatted = formatAuditValueForDiff('{"a":1}', 'JSON');
    expect(formatted).toBe('{\n  "a": 1\n}');
  });

  test('detects diff for string changes', () => {
    const data = {
      valueType: 'String' as const,
      oldStringValue: 'alpha',
      newStringValue: 'beta',
    };
    expect(canShowAuditValueDiff(data)).toBe(true);
    expect(getAuditDiffTexts(data)).toEqual({
      oldText: 'alpha',
      newText: 'beta',
      language: 'plaintext',
    });
  });

  test('treats CLOB as plain text', () => {
    const data = {
      valueType: 'CLOB' as const,
      oldClobValue: 'Hello world',
      newClobValue: 'Hello universe',
    };
    expect(getAuditDiffTexts(data)).toEqual({
      oldText: 'Hello world',
      newText: 'Hello universe',
      language: 'plaintext',
    });
  });

  test('does not offer diff for date values', () => {
    const data = {
      valueType: 'Date' as const,
      oldDatetimeValue: '2024-01-01T00:00:00Z',
      newDatetimeValue: '2024-06-01T00:00:00Z',
    };
    expect(canShowAuditValueDiff(data)).toBe(false);
  });

  test('disables diff when values are equal', () => {
    const data = {
      valueType: 'String' as const,
      oldStringValue: 'same',
      newStringValue: 'same',
    };
    expect(canShowAuditValueDiff(data)).toBe(false);
  });
});
