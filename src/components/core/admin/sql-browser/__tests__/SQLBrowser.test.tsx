import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SQLBrowser from '@/components/core/admin/sql-browser/SQLBrowser';

// Mock the useHasRole hook
vi.mock('@/hooks/use-has-role', () => ({
  useHasRole: vi.fn(),
}));

// Mock react-resizable-panels
vi.mock('react-resizable-panels', () => ({
  Group: ({ children, className }: any) => <div className={className}>{children}</div>,
  Panel: ({ children, className }: any) => <div className={className}>{children}</div>,
  Separator: ({ children, className }: any) => <div className={className}>{children}</div>,
  useGroupRef: () => ({ current: null }),
  usePanelRef: () => ({ current: null }),
}));

// Mock the Monaco Editor
vi.mock('@monaco-editor/react', () => {
  return {
    default: function MockEditor({ value, onChange }: any) {
      return <textarea data-testid="monaco-editor" value={value} onChange={(e) => onChange?.(e.target.value)} />;
    },
  };
});

// Mock SchemaExplorer to prevent async behavior
vi.mock('@/components/core/admin/sql-browser/SchemaExplorer', () => ({
  default: function MockSchemaExplorer() {
    return <div data-testid="schema-explorer">Database Schema</div>;
  },
}));

// Mock fetch to prevent actual API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ schemas: [] }),
    ok: true,
  } as Response),
);

describe('SQLBrowser', () => {
  let mockUseHasRole: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    const { useHasRole } = await import('@/hooks/use-has-role');
    mockUseHasRole = vi.mocked(useHasRole);
  });

  it('should render access denied for non-admin users', () => {
    mockUseHasRole.mockReturnValue(false);

    act(() => {
      render(<SQLBrowser />);
    });

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Access restricted to admins.')).toBeInTheDocument();
  });

  it('should render SQL browser for admin users', () => {
    mockUseHasRole.mockReturnValue(true);

    act(() => {
      render(<SQLBrowser />);
    });

    expect(screen.getByText('Database Schema')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    mockUseHasRole.mockReturnValue(true);

    act(() => {
      render(<SQLBrowser />);
    });

    // Check for main sections
    expect(screen.getByText('Database Schema')).toBeInTheDocument();
    // Query 1 appears in multiple places (subtitle and tab), so use getAllByText
    expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
  });
});
