import { describe, it, expect } from 'vitest';
import { generateQueryTypes } from '../types';
import type { DataSource } from '../types';

describe('generateQueryTypes', () => {
  it('generates correct types for Number attributes', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'id',
        name: 'ID',
        type: 'Number',
        primary: true,
        select: true,
        insert: true,
      },
      {
        code: 'count',
        name: 'Count',
        type: 'Number',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);
    expect(result).toContain('id: number;');
    expect(result).toContain('count: number;');
  });

  it('generates correct types for String attributes', () => {
    const attributes: DataSource['attributes'] = [
      { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
      {
        code: 'description',
        name: 'Description',
        type: 'Text',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);
    expect(result).toContain('name: string;');
    expect(result).toContain('description: string;');
  });

  it('generates correct types for Boolean attributes', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'isActive',
        name: 'Is Active',
        type: 'Boolean',
        select: true,
        insert: true,
      },
      {
        code: 'isDeleted',
        name: 'Is Deleted',
        type: 'Boolean',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);
    expect(result).toContain('isActive: boolean;');
    expect(result).toContain('isDeleted: boolean;');
  });

  it('generates correct types for Date attributes', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'createdAt',
        name: 'Created At',
        type: 'Date',
        select: true,
        insert: true,
      },
      {
        code: 'updatedAt',
        name: 'Updated At',
        type: 'Date',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);
    expect(result).toContain('createdAt: string;'); // ISO date string
    expect(result).toContain('updatedAt: string;'); // ISO date string
  });

  it('generates correct types for JSON attributes', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'metadata',
        name: 'Metadata',
        type: 'JSON',
        select: true,
        insert: true,
      },
      {
        code: 'settings',
        name: 'Settings',
        type: 'JSON',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);
    expect(result).toContain('metadata: any;');
    expect(result).toContain('settings: any;');
  });

  it('generates correct types for unknown attributes', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'unknownField',
        name: 'Unknown Field',
        type: 'Unknown' as any,
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);
    expect(result).toContain('unknownField: string;'); // Defaults to string
  });

  it('generates complete interface structure', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'id',
        name: 'ID',
        type: 'Number',
        primary: true,
        select: true,
        insert: true,
      },
      { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
      {
        code: 'isActive',
        name: 'Is Active',
        type: 'Boolean',
        select: true,
        insert: true,
      },
      {
        code: 'createdAt',
        name: 'Created At',
        type: 'Date',
        select: true,
        insert: true,
      },
      {
        code: 'metadata',
        name: 'Metadata',
        type: 'JSON',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);

    expect(result).toContain('interface DataSourceAttributes {');
    expect(result).toContain('id: number;');
    expect(result).toContain('name: string;');
    expect(result).toContain('isActive: boolean;');
    expect(result).toContain('createdAt: string;');
    expect(result).toContain('metadata: any;');
    expect(result).toContain('declare global {');
    expect(result).toContain('const query: QueryOptions;');
  });

  it('handles empty attributes array', () => {
    const attributes: DataSource['attributes'] = [];

    const result = generateQueryTypes(attributes);

    expect(result).toContain('interface DataSourceAttributes {');
    expect(result).toContain('declare global {');
    expect(result).toContain('const query: QueryOptions;');
  });

  it('handles attributes with special characters in code', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'user_id',
        name: 'User ID',
        type: 'Number',
        select: true,
        insert: true,
      },
      {
        code: 'created_at',
        name: 'Created At',
        type: 'Date',
        select: true,
        insert: true,
      },
      {
        code: 'is_active',
        name: 'Is Active',
        type: 'Boolean',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);

    expect(result).toContain('user_id: number;');
    expect(result).toContain('created_at: string;');
    expect(result).toContain('is_active: boolean;');
  });

  it('handles attributes with spaces in code', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'user id',
        name: 'User ID',
        type: 'Number',
        select: true,
        insert: true,
      },
      {
        code: 'created at',
        name: 'Created At',
        type: 'Date',
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);

    expect(result).toContain('user id: number;');
    expect(result).toContain('created at: string;');
  });

  it('handles mixed attribute types', () => {
    const attributes: DataSource['attributes'] = [
      {
        code: 'id',
        name: 'ID',
        type: 'Number',
        primary: true,
        select: true,
        insert: true,
      },
      { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
      {
        code: 'isActive',
        name: 'Is Active',
        type: 'Boolean',
        select: true,
        insert: true,
      },
      {
        code: 'createdAt',
        name: 'Created At',
        type: 'Date',
        select: true,
        insert: true,
      },
      {
        code: 'metadata',
        name: 'Metadata',
        type: 'JSON',
        select: true,
        insert: true,
      },
      {
        code: 'unknownField',
        name: 'Unknown Field',
        type: 'Unknown' as any,
        select: true,
        insert: true,
      },
    ];

    const result = generateQueryTypes(attributes);

    expect(result).toContain('id: number;');
    expect(result).toContain('name: string;');
    expect(result).toContain('isActive: boolean;');
    expect(result).toContain('createdAt: string;');
    expect(result).toContain('metadata: any;');
    expect(result).toContain('unknownField: string;');
  });

  it('generates proper indentation', () => {
    const attributes: DataSource['attributes'] = [
      { code: 'id', name: 'ID', type: 'Number', select: true, insert: true },
      { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
    ];

    const result = generateQueryTypes(attributes);

    // Check that the interface properties are properly indented
    expect(result).toContain('  id: number;');
    expect(result).toContain('  name: string;');
  });

  it('handles undefined attributes', () => {
    // The function doesn't handle undefined gracefully, so we expect it to throw
    expect(() => generateQueryTypes(undefined as any)).toThrow();
  });
});
