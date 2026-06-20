/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultTabs } from '../../components/result-tabs';
import type { ApiResponse } from '../../types';

// Mock dependencies
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant, className }: any) => (
    <div data-testid="alert" data-variant={variant} className={className}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, className }: any) => (
    <div data-testid="alert-description" className={className}>
      {children}
    </div>
  ),
  AlertTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableCell: ({ children, className }: any) => (
    <td data-testid="table-cell" className={className}>
      {children}
    </td>
  ),
  TableHead: ({ children, className }: any) => (
    <th data-testid="table-head" className={className}>
      {children}
    </th>
  ),
  TableHeader: ({ children, className }: any) => (
    <thead data-testid="table-header" className={className}>
      {children}
    </thead>
  ),
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children, className }: any) => (
    <tr data-testid="table-row" className={className}>
      {children}
    </tr>
  ),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange, className }: any) => (
    <div data-testid="tabs" data-value={value} className={className} data-on-value-change={String(!!onValueChange)}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tabs-content-${value}`} className={className}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button type="button" data-testid={`tab-trigger-${value}`} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('../../MonacoEditorLazy', () => ({
  LazyMonacoEditor: ({ value, type, disabled }: any) => (
    <div data-testid="monaco-editor" data-type={type} data-disabled={disabled}>
      {value}
    </div>
  ),
}));

vi.mock('../../components/empty-state', () => ({
  default: () => <div data-testid="empty-state">Empty State</div>,
}));

const mockApiResponse: ApiResponse = {
  status: 'OK',
  rows: [
    { id: 1, name: 'Test Item 1' },
    { id: 2, name: 'Test Item 2' },
  ],
  count: 2,
  elapsed: 150,
  sql: 'SELECT * FROM test_table WHERE id > 0',
  params: [0],
};

const mockHeaders = new Headers({
  'content-type': 'application/json',
  'x-total-count': '2',
  'x-query-time': '150ms',
});

describe('ResultTabs', () => {
  const defaultProps = {
    resultMode: 'Result' as const,
    setResultMode: vi.fn(),
    response: null,
    error: null,
    headers: null,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no response and no error', () => {
    render(<ResultTabs {...defaultProps} />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders tabs structure when there is a response', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Result')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Debug')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Headers')).toBeInTheDocument();
  });

  it('displays correct result mode', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'Result');
  });

  it('shows response status badge for OK response', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    const badges = screen.getAllByTestId('badge');
    const statusBadge = badges.find((badge) => badge.textContent?.includes('OK'));
    expect(statusBadge).toBeInTheDocument();
  });

  it('shows error status badge for error response', () => {
    const errorResponse: ApiResponse = { ...mockApiResponse, status: 'ERROR' };
    render(<ResultTabs {...defaultProps} response={errorResponse} />);

    const badges = screen.getAllByTestId('badge');
    const statusBadge = badges.find((badge) => badge.textContent?.includes('ERROR'));
    expect(statusBadge).toBeInTheDocument();
  });

  it('shows elapsed time', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    expect(screen.getByText('150ms')).toBeInTheDocument();
  });

  it('shows row count', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} loading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error alert when there is an error', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} error="Test error message" />);

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'destructive');
    expect(screen.getByTestId('alert-description')).toHaveTextContent('Test error message');
  });

  it('displays result content when no error', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    expect(screen.getByTestId('tabs-content-Result')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-type', 'Result');
  });

  it('displays debug content with SQL query', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} resultMode="Debug" />);

    expect(screen.getByTestId('tabs-content-Debug')).toBeInTheDocument();
    expect(screen.getByText('SQL Query')).toBeInTheDocument();
    expect(screen.getByText('SELECT * FROM test_table WHERE id > 0')).toBeInTheDocument();
  });

  it('displays debug content with parameters', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} resultMode="Debug" />);

    expect(screen.getByText('Parameters')).toBeInTheDocument();
  });

  it('displays headers content', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} headers={mockHeaders} resultMode="Headers" />);

    expect(screen.getByTestId('tabs-content-Headers')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('has tab value change handler', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    const tabs = screen.getByTestId('tabs');
    expect(tabs).toHaveAttribute('data-on-value-change', 'true');
  });

  it('handles response without SQL or params', () => {
    const responseWithoutDebug: ApiResponse = {
      status: 'OK',
      rows: [{ id: 1, name: 'Test' }],
      count: 1,
    };

    render(<ResultTabs {...defaultProps} response={responseWithoutDebug} resultMode="Debug" />);

    expect(screen.getByTestId('tabs-content-Debug')).toBeInTheDocument();
    // Should not show SQL or Parameters sections
    expect(screen.queryByText('SQL Query')).not.toBeInTheDocument();
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument();
  });

  it('handles response without headers', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} resultMode="Headers" />);

    expect(screen.getByTestId('tabs-content-Headers')).toBeInTheDocument();
    // Should not show headers table when no headers
    expect(screen.queryByTestId('table')).not.toBeInTheDocument();
  });

  it('handles response without count or rows', () => {
    const responseWithoutCount: ApiResponse = {
      status: 'OK',
      rows: [],
    };

    render(<ResultTabs {...defaultProps} response={responseWithoutCount} />);

    expect(screen.getByText('0 rows')).toBeInTheDocument();
  });

  it('handles response without elapsed time', () => {
    const responseWithoutElapsed: ApiResponse = {
      status: 'OK',
      rows: [{ id: 1, name: 'Test' }],
      count: 1,
    };

    render(<ResultTabs {...defaultProps} response={responseWithoutElapsed} />);

    // Should not show elapsed time
    expect(screen.queryByText(/^\d+ms$/)).not.toBeInTheDocument();
  });

  it('renders tab trigger content with icons', () => {
    render(<ResultTabs {...defaultProps} response={mockApiResponse} />);

    expect(screen.getByTestId('tab-trigger-Result')).toHaveTextContent('Result');
    expect(screen.getByTestId('tab-trigger-Debug')).toHaveTextContent('Debug');
    expect(screen.getByTestId('tab-trigger-Headers')).toHaveTextContent('Headers');
  });
});
