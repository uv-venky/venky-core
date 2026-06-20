/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiTesterContent } from '../page-content';

// Mock dependencies
vi.mock('@/components/core/session-context', () => ({
  useClientSession: () => ({
    userName: 'testuser',
    roles: ['admin', 'user'],
  }),
}));

vi.mock('../context', () => ({
  useApiTester: () => ({
    state: {
      dataSources: [
        {
          id: 'test-ds',
          type: 'table',
          description: 'Test Data Source',
          readOnly: false,
          attributes: [
            {
              code: 'id',
              type: 'Number',
              primary: true,
              select: true,
              insert: true,
            },
            { code: 'name', type: 'String', select: true, insert: true },
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
        },
      ],
      selectedDS: {
        id: 'test-ds',
        type: 'table',
        description: 'Test Data Source',
        readOnly: false,
        attributes: [
          {
            code: 'id',
            type: 'Number',
            primary: true,
            select: true,
            insert: true,
          },
          { code: 'name', type: 'String', select: true, insert: true },
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
      },
      queryMode: 'Query',
      resultMode: 'Result',
      role: 'admin',
      queryData: '{"filter": [], "select": ["id", "name"], "limit": 10}',
      postData: '[{"name": "Test"}]',
      response: null,
      loading: false,
      error: null,
      headers: null,
    },
    dispatch: {
      setSelectedDS: vi.fn(),
      setQueryMode: vi.fn(),
      setResultMode: vi.fn(),
      setRole: vi.fn(),
      setQueryData: vi.fn(),
      setPostData: vi.fn(),
      setResponse: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setHeaders: vi.fn(),
    },
    executeQuery: vi.fn(),
  }),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, className }: any) => (
    <div data-testid="tabs" data-value={value} className={className}>
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

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button type="button" data-testid="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/core/page/PageLayout', () => ({
  default: ({ title, subTitle, icon, toolbar, mainSection }: any) => (
    <div data-testid="page-layout" data-title={title} data-subtitle={subTitle}>
      {icon && <div data-testid="page-icon">{icon}</div>}
      {toolbar && <div data-testid="page-toolbar">{toolbar}</div>}
      {mainSection && <div data-testid="page-main-section">{mainSection}</div>}
    </div>
  ),
}));

vi.mock('@/components/core/page/fields', () => ({
  SelectInput: ({ value, options, className, placeholder }: any) => (
    <select data-testid="select-input" value={value || ''} className={className}>
      <option value="">{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('../components/query-tab', () => ({
  QueryTab: ({ selectedDS, queryData }: any) => (
    <div data-testid="query-tab" data-ds={selectedDS?.id} data-query={queryData}>
      Query Tab
    </div>
  ),
}));

vi.mock('../components/post-tab', () => ({
  PostTab: ({ selectedDS, postData }: any) => (
    <div data-testid="post-tab" data-ds={selectedDS?.id} data-post={postData}>
      Post Tab
    </div>
  ),
}));

vi.mock('../components/datasource-tab', () => ({
  DataSourceTab: ({ selectedDS }: any) => (
    <div data-testid="datasource-tab" data-ds={selectedDS?.id}>
      Data Source Tab
    </div>
  ),
  getWhoAttributesCount: () => 4,
  isMissingPrimaryKey: () => false,
}));

vi.mock('../components/security-panel', () => ({
  SecurityPanel: ({ roleCode, userName }: any) => (
    <div data-testid="security-panel" data-role={roleCode} data-user={userName}>
      Security Panel
    </div>
  ),
}));

vi.mock('../components/result-tabs', () => ({
  ResultTabs: ({ resultMode, loading }: any) => (
    <div data-testid="result-tabs" data-mode={resultMode} data-loading={String(loading)}>
      Result Tabs
    </div>
  ),
}));

vi.mock('../components/datasource-panel', () => ({
  DataSourcePanel: ({ selectedDataSource }: any) => (
    <div data-testid="datasource-panel" data-selected={selectedDataSource}>
      Data Source Panel
    </div>
  ),
}));

// Mock fetch for executePost function
global.fetch = vi.fn();

describe('ApiTesterContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main layout with correct structure', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-title', 'API Playground');
    expect(screen.getByTestId('page-layout')).toHaveAttribute('data-subtitle', 'Testing test-ds');
    expect(screen.getByTestId('page-icon')).toBeInTheDocument();
    expect(screen.getByTestId('page-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('page-main-section')).toBeInTheDocument();
  });

  it('renders data source panel', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('datasource-panel')).toBeInTheDocument();
    expect(screen.getByTestId('datasource-panel')).toHaveAttribute('data-selected', 'test-ds');
  });

  it('renders security panel when data source is selected', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('security-panel')).toBeInTheDocument();
    expect(screen.getByTestId('security-panel')).toHaveAttribute('data-role', 'admin');
    expect(screen.getByTestId('security-panel')).toHaveAttribute('data-user', 'testuser');
  });

  it('renders tabs with correct structure', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'Query');
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
  });

  it('renders query tab when in query mode', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('query-tab')).toBeInTheDocument();
    expect(screen.getByTestId('query-tab')).toHaveAttribute('data-ds', 'test-ds');
  });

  it('renders execute button for query mode', () => {
    render(<ApiTesterContent />);

    const buttons = screen.getAllByTestId('button');
    const executeButton = buttons.find((btn) => btn.textContent?.includes('Execute Query'));
    expect(executeButton).toBeInTheDocument();
  });

  it('renders result tabs when not in DS mode', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('result-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('result-tabs')).toHaveAttribute('data-mode', 'Result');
    expect(screen.getByTestId('result-tabs')).toHaveAttribute('data-loading', 'false');
  });

  it('renders tab triggers for Query, Post, and DS modes', () => {
    render(<ApiTesterContent />);

    expect(screen.getByTestId('tab-trigger-Query')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-Post')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-DS')).toBeInTheDocument();
  });
});
