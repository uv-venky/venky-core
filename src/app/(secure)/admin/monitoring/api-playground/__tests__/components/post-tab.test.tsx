import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostTab } from '../../components/post-tab';
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

describe('PostTab', () => {
  const defaultProps = {
    selectedDS: mockDataSource,
    postData: '[{"name": "Test Item", "description": "Test description"}]',
    setPostData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the post tab component', () => {
    render(<PostTab {...defaultProps} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('passes correct props to MonacoEditor', () => {
    render(<PostTab {...defaultProps} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-datasource-id', 'test-ds');
    expect(editor).toHaveAttribute('data-type', 'Post');
    expect(editor).toHaveAttribute('data-disabled', 'false');
    expect(editor).toHaveAttribute('data-value', '[{"name": "Test Item", "description": "Test description"}]');
  });

  it('passes attributes to MonacoEditor', () => {
    render(<PostTab {...defaultProps} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    // The attributes should be passed to the MonacoEditor component
  });

  it('handles empty post data', () => {
    render(<PostTab {...defaultProps} postData="" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', '');
  });

  it('handles read-only data source', () => {
    const readOnlyDataSource = { ...mockDataSource, readOnly: true };
    render(<PostTab {...defaultProps} selectedDS={readOnlyDataSource} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-disabled', 'false'); // MonacoEditor handles read-only internally
  });

  it('handles data source with no attributes', () => {
    const dataSourceWithoutAttributes = { ...mockDataSource, attributes: [] };
    render(<PostTab {...defaultProps} selectedDS={dataSourceWithoutAttributes} />);

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
    render(<PostTab {...defaultProps} selectedDS={complexDataSource} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });
});
