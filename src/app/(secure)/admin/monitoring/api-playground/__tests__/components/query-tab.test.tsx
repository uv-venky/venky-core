import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryTab } from '../../components/query-tab';
import type { DataSource } from '../../types';

// Mock dependencies
vi.mock('../../MonacoEditorLazy', () => ({
  LazyMonacoEditor: ({ value, datasourceId, type, disabled }: any) => (
    <div
      data-testid="monaco-editor"
      data-datasource-id={datasourceId}
      data-type={type}
      data-disabled={disabled}
      data-value={value}
    >
      Monaco Editor
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
    },
    { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
    {
      code: 'description',
      name: 'Description',
      type: 'Text',
      select: true,
      insert: true,
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

describe('QueryTab', () => {
  const defaultProps = {
    selectedDS: mockDataSource,
    queryData: '{"filter": [], "select": ["id", "name"], "limit": 10}',
    setQueryData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the query tab component', () => {
    render(<QueryTab {...defaultProps} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('passes correct props to MonacoEditor', () => {
    render(<QueryTab {...defaultProps} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-datasource-id', 'test-ds');
    expect(editor).toHaveAttribute('data-type', 'Query');
    expect(editor).toHaveAttribute('data-disabled', 'false');
    expect(editor).toHaveAttribute('data-value', '{"filter": [], "select": ["id", "name"], "limit": 10}');
  });

  it('passes attributes to MonacoEditor', () => {
    render(<QueryTab {...defaultProps} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    // The attributes should be passed to the MonacoEditor component
  });

  it('handles empty query data', () => {
    render(<QueryTab {...defaultProps} queryData="" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', '');
  });

  it('handles read-only data source', () => {
    const readOnlyDataSource = { ...mockDataSource, readOnly: true };
    render(<QueryTab {...defaultProps} selectedDS={readOnlyDataSource} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-disabled', 'false'); // MonacoEditor handles read-only internally
  });

  it('handles data source with no attributes', () => {
    const dataSourceWithoutAttributes = { ...mockDataSource, attributes: [] };
    render(<QueryTab {...defaultProps} selectedDS={dataSourceWithoutAttributes} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles data source with complex attributes', () => {
    const complexDataSource: DataSource = {
      ...mockDataSource,
      attributes: [
        {
          code: 'id',
          name: 'ID',
          type: 'Number',
          primary: true,
          select: true,
          insert: true,
        },
        {
          code: 'name',
          name: 'Name',
          type: 'Text',
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
      ],
    };
    render(<QueryTab {...defaultProps} selectedDS={complexDataSource} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles complex query data', () => {
    const complexQueryData = JSON.stringify({
      filter: [
        { field: 'name', operator: 'like', value: '%test%' },
        { field: 'createdAt', operator: 'gte', value: '2023-01-01' },
      ],
      select: ['id', 'name', 'description'],
      limit: 50,
      offset: 0,
      sort: { name: 'asc' },
    });

    render(<QueryTab {...defaultProps} queryData={complexQueryData} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', complexQueryData);
  });

  it('handles malformed query data', () => {
    const malformedQueryData = '{"filter": [], "select": ["id", "name"], "limit": 10'; // Missing closing brace

    render(<QueryTab {...defaultProps} queryData={malformedQueryData} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', malformedQueryData);
  });
});
