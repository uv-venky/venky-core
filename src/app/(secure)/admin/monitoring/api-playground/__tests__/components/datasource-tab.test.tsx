/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataSourceTab, getWhoAttributesCount, isMissingPrimaryKey } from '../../components/datasource-tab';
import type { DataSource } from '../../types';

// Mock dependencies
vi.mock('@/components/core/session-context', () => ({
  useClientSession: () => ({
    userName: 'testuser',
    roles: ['admin', 'user'],
  }),
}));

vi.mock('../../MonacoEditorLazy', () => ({
  LazyMonacoEditor: ({ value, type, disabled }: any) => (
    <div data-testid="monaco-editor" data-type={type} data-disabled={disabled}>
      {value}
    </div>
  ),
}));

const mockDataSource: DataSource = {
  id: 'test-ds',
  type: 'table',
  description: 'Test Data Source',
  readOnly: false,
  attributes: [
    {
      code: 'id',
      name: 'ID',
      type: 'Number',
      primary: true,
      select: true,
      insert: true,
      optional: false,
    },
    {
      code: 'name',
      name: 'Name',
      type: 'Text',
      select: true,
      insert: true,
      optional: false,
    },
    {
      code: 'createdBy',
      name: 'Created By',
      type: 'Text',
      select: true,
      insert: true,
      optional: true,
    },
    {
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      select: true,
      insert: true,
      optional: true,
    },
    {
      code: 'updatedBy',
      name: 'Updated By',
      type: 'Text',
      select: true,
      insert: true,
      optional: true,
    },
    {
      code: 'updatedAt',
      name: 'Updated At',
      type: 'Date',
      select: true,
      insert: true,
      optional: true,
    },
  ],
  access: [
    {
      roleCode: 'admin',
      query: true,
      insert: true,
      update: true,
      delete: true,
    },
  ],
};

describe('DataSourceTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with Monaco editor', () => {
    render(<DataSourceTab selectedDS={mockDataSource} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('displays datasource and user roles when no filter is applied', () => {
    render(<DataSourceTab selectedDS={mockDataSource} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-type', 'Result');
    expect(editor).toHaveAttribute('data-disabled', 'true');

    // Should contain dataSource and userRoles in the JSON
    expect(editor.textContent).toContain('"dataSource"');
    expect(editor.textContent).toContain('"userRoles"');
  });

  it('filters attributes when filter is set to primary', () => {
    render(<DataSourceTab selectedDS={mockDataSource} filter="primary" />);

    const editor = screen.getByTestId('monaco-editor');
    // Should only show primary attribute (id)
    expect(editor.textContent).toContain('"code": "id"');
    expect(editor.textContent).not.toContain('"code": "name"');
  });

  it('filters attributes when filter is set to who', () => {
    render(<DataSourceTab selectedDS={mockDataSource} filter="who" />);

    const editor = screen.getByTestId('monaco-editor');
    // Should show WHO attributes
    expect(editor.textContent).toContain('"code": "createdBy"');
    expect(editor.textContent).toContain('"code": "createdAt"');
    expect(editor.textContent).not.toContain('"code": "id"');
    expect(editor.textContent).not.toContain('"code": "name"');
  });

  it('filters attributes when filter is set to required', () => {
    render(<DataSourceTab selectedDS={mockDataSource} filter="required" />);

    const editor = screen.getByTestId('monaco-editor');
    // Should show only non-optional attributes (id, name)
    expect(editor.textContent).toContain('"code": "id"');
    expect(editor.textContent).toContain('"code": "name"');
    // Optional attributes should not be shown
    expect(editor.textContent).not.toContain('"code": "createdBy"');
  });

  it('displays placeholder text when no data source selected', () => {
    // @ts-expect-error - Testing null/undefined behavior
    render(<DataSourceTab selectedDS={null} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor.textContent).toContain('Select a data source to view its definition');
  });

  it('handles data source with no attributes', () => {
    const emptyDataSource = { ...mockDataSource, attributes: [] };
    render(<DataSourceTab selectedDS={emptyDataSource} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});

describe('getWhoAttributesCount', () => {
  it('returns correct count for data source with all WHO attributes', () => {
    const result = getWhoAttributesCount(mockDataSource);
    expect(result).toBe(4); // createdBy, createdAt, updatedBy, updatedAt
  });

  it('returns correct count for data source with partial WHO attributes', () => {
    const partialWHODataSource = {
      ...mockDataSource,
      attributes: mockDataSource.attributes.filter((attr) => ['createdBy', 'createdAt'].includes(attr.code)),
    };
    const result = getWhoAttributesCount(partialWHODataSource);
    expect(result).toBe(2);
  });

  it('returns 0 for data source with no WHO attributes', () => {
    const noWHODataSource = {
      ...mockDataSource,
      attributes: mockDataSource.attributes.filter(
        (attr) => !['createdBy', 'createdAt', 'updatedBy', 'updatedAt'].includes(attr.code),
      ),
    };
    const result = getWhoAttributesCount(noWHODataSource);
    expect(result).toBe(0);
  });

  it('returns 0 for undefined data source', () => {
    const result = getWhoAttributesCount(undefined);
    expect(result).toBe(0);
  });
});

describe('isMissingPrimaryKey', () => {
  it('returns false for data source with primary key', () => {
    const result = isMissingPrimaryKey(mockDataSource);
    expect(result).toBe(false);
  });

  it('returns true for data source without primary key', () => {
    const noPrimaryDataSource = {
      ...mockDataSource,
      attributes: mockDataSource.attributes.map((attr) => ({
        ...attr,
        primary: false,
      })),
    };
    const result = isMissingPrimaryKey(noPrimaryDataSource);
    expect(result).toBe(true);
  });

  it('returns true for data source with no attributes', () => {
    const emptyDataSource = { ...mockDataSource, attributes: [] };
    const result = isMissingPrimaryKey(emptyDataSource);
    expect(result).toBe(true);
  });

  it('returns false for undefined data source', () => {
    const result = isMissingPrimaryKey(undefined);
    expect(result).toBe(false);
  });
});
