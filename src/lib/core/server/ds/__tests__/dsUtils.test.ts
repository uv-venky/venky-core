/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it as test } from 'vitest';
import {
  applyAuditValueToRow,
  classifyUpdateAttributes,
  getPkValueStr,
  getWhoAttributes,
  normalizeWhitespaceForPost,
  populateWHOColumnsForUpdate,
  serializeValueForAudit,
  toIsoString,
  validateAttributeConstraintsForPost,
  validateRowForUpdateOrDelete,
} from '../dsUtils';
import { TestDS, getTestRow, type TestDataSourceType } from './sample-ds';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource } from '@/lib/server/ds/defs/defaults';

describe('dsUtils', () => {
  describe('normalizeWhitespaceForPost', () => {
    test('trims Text and maps whitespace-only to undefined', () => {
      const ds: DataSource<{ name: string; notes?: string }> = {
        ...DefaultDataSource,
        id: 'TrimTest',
        tableName: 'trim_test',
        attributes: [
          { ...DefaultAttribute, code: 'name', name: 'Name', type: 'Text', column: 'name', optional: false },
          { ...DefaultAttribute, code: 'notes', name: 'Notes', type: 'Text', column: 'notes' },
        ],
        access: [],
      };
      const row = { name: '  a  ', notes: '   ', _status: 'U' as const };
      normalizeWhitespaceForPost(ds, [row]);
      expect(row.name).toBe('a');
      expect(row.notes).toBeUndefined();
    });

    test('skips delete rows', () => {
      const ds: DataSource<{ name: string }> = {
        ...DefaultDataSource,
        id: 'TrimTest2',
        tableName: 'trim_test2',
        attributes: [
          { ...DefaultAttribute, code: 'name', name: 'Name', type: 'Text', column: 'name', optional: false },
        ],
        access: [],
      };
      const row = { name: '  x  ', _status: 'D' as const };
      normalizeWhitespaceForPost(ds, [row]);
      expect(row.name).toBe('  x  ');
    });

    test('does not trim JSON', () => {
      const ds: DataSource<{ payload: unknown }> = {
        ...DefaultDataSource,
        id: 'TrimTest3',
        tableName: 'trim_test3',
        attributes: [{ ...DefaultAttribute, code: 'payload', name: 'Payload', type: 'JSON', column: 'payload' }],
        access: [],
      };
      const raw = '  {"a":1}  ';
      const row = { payload: raw, _status: 'U' as const };
      normalizeWhitespaceForPost(ds, [row]);
      expect(row.payload).toBe(raw);
    });

    test('skipTrimOnPost skips attribute', () => {
      const ds: DataSource<{ code: string }> = {
        ...DefaultDataSource,
        id: 'TrimTest4',
        tableName: 'trim_test4',
        attributes: [
          {
            ...DefaultAttribute,
            code: 'code',
            name: 'Code',
            type: 'Text',
            column: 'code',
            optional: false,
            skipTrimOnPost: true,
          },
        ],
        access: [],
      };
      const row = { code: '  ab  ', _status: 'U' as const };
      normalizeWhitespaceForPost(ds, [row]);
      expect(row.code).toBe('  ab  ');
    });

    test('TextArray trims string elements', () => {
      const ds: DataSource<{ tags: string[] }> = {
        ...DefaultDataSource,
        id: 'TrimTest5',
        tableName: 'trim_test5',
        attributes: [{ ...DefaultAttribute, code: 'tags', name: 'Tags', type: 'TextArray', column: 'tags' }],
        access: [],
      };
      const row = { tags: ['  a  ', ' b '], _status: 'U' as const };
      normalizeWhitespaceForPost(ds, [row]);
      expect(row.tags).toEqual(['a', 'b']);
    });
  });

  describe('validateAttributeConstraintsForPost', () => {
    test('accepts string within maxLength', () => {
      const ds: DataSource<{ code: string }> = {
        ...DefaultDataSource,
        id: 'LenTest',
        tableName: 'len_test',
        attributes: [
          {
            ...DefaultAttribute,
            code: 'code',
            name: 'Code',
            type: 'Text',
            column: 'code',
            maxLength: 5,
          },
        ],
        access: [],
      };
      expect(() => validateAttributeConstraintsForPost(ds, [{ code: 'abcde', _status: 'I' }])).not.toThrow();
    });

    test('throws when string exceeds maxLength', () => {
      const ds: DataSource<{ code: string }> = {
        ...DefaultDataSource,
        id: 'LenTest2',
        tableName: 'len_test2',
        attributes: [
          {
            ...DefaultAttribute,
            code: 'code',
            name: 'Code',
            type: 'Text',
            column: 'code',
            maxLength: 3,
          },
        ],
        access: [],
      };
      expect(() => validateAttributeConstraintsForPost(ds, [{ code: 'abcd', _status: 'I' }])).toThrow(
        'Attribute [LenTest2.Code] value is too long (4 characters; max allowed is 3).',
      );
    });

    test('enforces Number min and max', () => {
      const ds: DataSource<{ qty: number }> = {
        ...DefaultDataSource,
        id: 'NumTest',
        tableName: 'num_test',
        attributes: [
          {
            ...DefaultAttribute,
            code: 'qty',
            name: 'Qty',
            type: 'Number',
            column: 'qty',
            min: 1,
            max: 10,
          },
        ],
        access: [],
      };
      expect(() => validateAttributeConstraintsForPost(ds, [{ qty: 0, _status: 'U' }])).toThrow(
        'NumTest.Qty must be at least 1',
      );
      expect(() => validateAttributeConstraintsForPost(ds, [{ qty: 11, _status: 'U' }])).toThrow(
        'NumTest.Qty must be at most 10',
      );
      expect(() => validateAttributeConstraintsForPost(ds, [{ qty: 5, _status: 'U' }])).not.toThrow();
    });

    test('skips delete rows', () => {
      const ds: DataSource<{ code: string }> = {
        ...DefaultDataSource,
        id: 'LenTest3',
        tableName: 'len_test3',
        attributes: [
          {
            ...DefaultAttribute,
            code: 'code',
            name: 'Code',
            type: 'Text',
            column: 'code',
            maxLength: 2,
          },
        ],
        access: [],
      };
      expect(() => validateAttributeConstraintsForPost(ds, [{ code: 'long', _status: 'D' }])).not.toThrow();
    });

    test('TextArray element maxLength', () => {
      const ds: DataSource<{ tags: string[] }> = {
        ...DefaultDataSource,
        id: 'ArrTest',
        tableName: 'arr_test',
        attributes: [
          {
            ...DefaultAttribute,
            code: 'tags',
            name: 'Tags',
            type: 'TextArray',
            column: 'tags',
            maxLength: 2,
          },
        ],
        access: [],
      };
      expect(() => validateAttributeConstraintsForPost(ds, [{ tags: ['a', 'nope'], _status: 'I' }])).toThrow(
        'Attribute [ArrTest.Tags] item 2 is too long (4 characters; max allowed is 2).',
      );
    });
  });

  describe('serializeValueForAudit', () => {
    test('returns string as-is', () => {
      expect(serializeValueForAudit('hello')).toBe('hello');
    });
    test('converts number to string', () => {
      expect(serializeValueForAudit(42)).toBe('42');
    });
    test('converts object to JSON string', () => {
      expect(serializeValueForAudit({ a: 1 })).toBe('{"a":1}');
    });
    test('converts null to string', () => {
      expect(serializeValueForAudit(null)).toBe('null');
    });
    test('converts Date to JSON string (quoted ISO)', () => {
      const d = new Date('2024-01-15T12:00:00.000Z');
      expect(serializeValueForAudit(d)).toBe(JSON.stringify(d));
    });
  });

  describe('toIsoString', () => {
    test('returns ISO string for Date', () => {
      const d = new Date('2024-01-15T12:00:00.000Z');
      expect(toIsoString(d)).toBe('2024-01-15T12:00:00.000Z');
    });
    test('returns string as-is when non-empty', () => {
      expect(toIsoString('2024-01-15')).toBe('2024-01-15');
    });
    test('returns null for empty string', () => {
      expect(toIsoString('')).toBeNull();
    });
    test('returns null for null', () => {
      expect(toIsoString(null)).toBeNull();
    });
    test('returns null for undefined', () => {
      expect(toIsoString(undefined)).toBeNull();
    });
    test('returns null for number', () => {
      expect(toIsoString(42)).toBeNull();
    });
  });

  describe('getWhoAttributes', () => {
    test('returns updatedBy and updatedAt for DS with WHO columns', () => {
      const { updatedByAttr, updatedAtAttr } = getWhoAttributes(TestDS);
      expect(updatedByAttr.code).toBe('updatedBy');
      expect(updatedAtAttr.code).toBe('updatedAt');
    });
    test('throws when DS has no updatedBy', () => {
      const dsNoWho: DataSource<{ id: string; updatedAt: string }> = {
        ...DefaultDataSource,
        id: 'NoWho',
        tableName: 'x',
        attributes: [
          { ...DefaultAttribute, code: 'id', name: 'Id', primary: true, optional: false },
          { ...DefaultAttribute, code: 'updatedAt', name: 'Updated At' },
        ],
        access: [],
      };
      expect(() => getWhoAttributes(dsNoWho)).toThrow('has no updatedBy or updatedAt');
    });
    test('throws when DS has no updatedAt', () => {
      const dsNoWho: DataSource<{ id: string; updatedBy: string }> = {
        ...DefaultDataSource,
        id: 'NoWho',
        tableName: 'x',
        attributes: [
          { ...DefaultAttribute, code: 'id', name: 'Id', primary: true, optional: false },
          { ...DefaultAttribute, code: 'updatedBy', name: 'Updated By' },
        ],
        access: [],
      };
      expect(() => getWhoAttributes(dsNoWho)).toThrow('has no updatedBy or updatedAt');
    });
  });

  describe('classifyUpdateAttributes', () => {
    test('returns pkAttributes containing primary attr', () => {
      const { pkAttributes } = classifyUpdateAttributes(TestDS);
      expect(pkAttributes).toHaveLength(1);
      expect(pkAttributes[0].code).toBe('roleCode');
    });
    test('returns readOnlyColumns and auditAttributes arrays', () => {
      const { readOnlyColumns, auditAttributes } = classifyUpdateAttributes(TestDS);
      expect(Array.isArray(readOnlyColumns)).toBe(true);
      expect(Array.isArray(auditAttributes)).toBe(true);
    });
  });

  describe('getPkValueStr', () => {
    test('returns single PK value string', () => {
      const row = getTestRow(1);
      const pkAttributes = TestDS.attributes.filter((a) => a.primary);
      expect(pkAttributes.length).toBeGreaterThan(0);
      expect(getPkValueStr(row, pkAttributes)).toBe('test1');
    });
    test('throws when PK value is null', () => {
      const row = { ...getTestRow(1), roleCode: null } as unknown as Parameters<
        typeof getPkValueStr<TestDataSourceType>
      >[0];
      const pkAttributes = TestDS.attributes.filter((a) => a.primary);
      expect(() => getPkValueStr(row, pkAttributes)).toThrow('Primary key attribute');
    });
  });

  describe('applyAuditValueToRow', () => {
    test('sets oldDoubleValue for Number and prefix old', () => {
      const auditRow: Record<string, unknown> = { valueType: 'String' };
      const attr = TestDS.attributes.find((a) => a.code === 'seqNo');
      if (!attr) throw new Error('test setup');
      applyAuditValueToRow(
        TestDS,
        attr,
        100,
        auditRow as Parameters<typeof applyAuditValueToRow<TestDataSourceType>>[3],
        'old',
      );
      expect(auditRow.oldDoubleValue).toBe(100);
      expect(auditRow.valueType).toBe('Number');
    });
    test('sets newDoubleValue for Number and prefix new', () => {
      const auditRow: Record<string, unknown> = { valueType: 'String' };
      const attr = TestDS.attributes.find((a) => a.code === 'seqNo');
      if (!attr) throw new Error('test setup');
      applyAuditValueToRow(
        TestDS,
        attr,
        200,
        auditRow as Parameters<typeof applyAuditValueToRow<TestDataSourceType>>[3],
        'new',
      );
      expect(auditRow.newDoubleValue).toBe(200);
      expect(auditRow.valueType).toBe('Number');
    });
    test('sets oldDatetimeValue for Date string and prefix old', () => {
      const auditRow: Record<string, unknown> = { valueType: 'String' };
      const attr = TestDS.attributes.find((a) => a.code === 'updatedAt');
      if (!attr) throw new Error('test setup');
      applyAuditValueToRow(
        TestDS,
        attr,
        '2024-01-15T00:00:00.000Z',
        auditRow as Parameters<typeof applyAuditValueToRow<TestDataSourceType>>[3],
        'old',
      );
      expect(auditRow.oldDatetimeValue).toBe('2024-01-15T00:00:00.000Z');
      expect(auditRow.valueType).toBe('Date');
    });
    test('sets oldStringValue for string and prefix old', () => {
      const auditRow: Record<string, unknown> = { valueType: 'String' };
      const attr = TestDS.attributes.find((a) => a.code === 'roleName');
      if (!attr) throw new Error('test setup');
      applyAuditValueToRow(
        TestDS,
        attr,
        'Admin',
        auditRow as Parameters<typeof applyAuditValueToRow<TestDataSourceType>>[3],
        'old',
      );
      expect(auditRow.oldStringValue).toBe('Admin');
      expect(auditRow.valueType).toBe('String');
    });
    test('does nothing when value is null', () => {
      const auditRow: Record<string, unknown> = { valueType: 'String' };
      const attr = TestDS.attributes.find((a) => a.code === 'seqNo');
      if (!attr) throw new Error('test setup');
      applyAuditValueToRow(
        TestDS,
        attr,
        null,
        auditRow as Parameters<typeof applyAuditValueToRow<TestDataSourceType>>[3],
        'old',
      );
      expect(auditRow.oldDoubleValue).toBeUndefined();
    });
    test('throws for invalid Number value', () => {
      const auditRow: Record<string, unknown> = {};
      const attr = TestDS.attributes.find((a) => a.code === 'seqNo');
      if (!attr) throw new Error('test setup');
      expect(() =>
        applyAuditValueToRow(
          TestDS,
          attr,
          'not-a-number',
          auditRow as Parameters<typeof applyAuditValueToRow<TestDataSourceType>>[3],
          'old',
        ),
      ).toThrow('Invalid value');
    });
  });

  describe('validateRowForUpdateOrDelete', () => {
    test('does not throw when primary is present', () => {
      const row = getTestRow(1);
      const pkAttr = TestDS.attributes.find((a) => a.primary);
      if (!pkAttr) throw new Error('test setup');
      expect(() => validateRowForUpdateOrDelete(TestDS, row, pkAttr, null)).not.toThrow();
    });
    test('throws when primary is null', () => {
      const row = { ...getTestRow(1), roleCode: null } as unknown as Parameters<
        typeof validateRowForUpdateOrDelete<TestDataSourceType>
      >[1];
      const pkAttr = TestDS.attributes.find((a) => a.primary);
      if (!pkAttr) throw new Error('test setup');
      expect(() => validateRowForUpdateOrDelete(TestDS, row, pkAttr, null)).toThrow(
        'Missing value for mandatory attribute',
      );
    });
    test('does not throw when update attr is present and in attributesInUpdate', () => {
      const row = getTestRow(1);
      const attr = TestDS.attributes.find((a) => a.code === 'roleName');
      if (!attr) throw new Error('test setup');
      expect(() => validateRowForUpdateOrDelete(TestDS, row, attr, new Set(['roleName']))).not.toThrow();
    });
    test('throws when update attr is null and in attributesInUpdate', () => {
      const row = { ...getTestRow(1), roleName: null } as unknown as Parameters<
        typeof validateRowForUpdateOrDelete<TestDataSourceType>
      >[1];
      const attr = TestDS.attributes.find((a) => a.code === 'roleName');
      if (!attr) throw new Error('test setup');
      expect(() => validateRowForUpdateOrDelete(TestDS, row, attr, new Set(['roleName']))).toThrow(
        'Missing value for mandatory attribute',
      );
    });
  });

  describe('populateWHOColumnsForUpdate', () => {
    test('sets updatedBy and updatedAt on rows', () => {
      const row = getTestRow(1);
      row.updatedBy = '';
      row.updatedAt = '';
      populateWHOColumnsForUpdate(TEST_SESSION, TestDS, [row]);
      expect(row.updatedBy).toBe(TEST_SESSION.user.userName);
      expect(row.updatedAt).toBeDefined();
      expect(typeof row.updatedAt).toBe('string');
      expect(row.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
