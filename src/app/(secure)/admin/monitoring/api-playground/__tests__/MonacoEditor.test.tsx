import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonacoEditor from '../MonacoEditor';

// Mock dependencies
vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, value, options }: any) => {
    // Simulate the onMount callback
    setTimeout(() => {
      if (onMount) {
        const mockEditor = {
          setValue: vi.fn(),
          getValue: vi.fn(() => value),
          onDidChangeModelContent: vi.fn(),
        };
        const mockMonaco = {
          json: {
            jsonDefaults: {
              setDiagnosticsOptions: vi.fn(),
            },
          },
        };
        onMount(mockEditor, mockMonaco);
      }
    }, 0);

    return (
      <div data-testid="monaco-editor" data-value={value} data-options={JSON.stringify(options)}>
        Monaco Editor
      </div>
    );
  },
}));

vi.mock('@/components/core/hooks/useAutoSizer', () => ({
  default: () => ({
    height: 400,
    width: 800,
    Container: ({ children }: any) => <div data-testid="auto-sizer-container">{children}</div>,
  }),
}));

vi.mock('@/components/core/common/Notification', () => ({
  showError: vi.fn(),
}));

vi.mock('@/lib/core/common/error', () => ({
  isErrorResponse: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('MonacoEditor', () => {
  const defaultProps = {
    value: '{"test": "value"}',
    type: 'Query' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ status: 'OK', schema: '{"type": "object"}' }),
      ok: true,
    });
  });

  it('renders the Monaco editor component', () => {
    render(<MonacoEditor {...defaultProps} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('passes correct props to Monaco editor', () => {
    render(<MonacoEditor {...defaultProps} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', '{"test": "value"}');
  });

  it('handles different editor types', () => {
    render(<MonacoEditor {...defaultProps} type="Post" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<MonacoEditor {...defaultProps} disabled={true} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles datasourceId prop', () => {
    render(<MonacoEditor {...defaultProps} datasourceId="test-ds" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles placeholder prop', () => {
    render(<MonacoEditor {...defaultProps} placeholder="Enter JSON here" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles onChange callback', () => {
    const onChange = vi.fn();
    render(<MonacoEditor {...defaultProps} onChange={onChange} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    // The onChange would be called by the Monaco editor internally
  });

  it('handles empty value', () => {
    render(<MonacoEditor {...defaultProps} value="" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', '');
  });

  it('handles complex JSON value', () => {
    const complexValue = JSON.stringify({
      filter: [
        { field: 'name', operator: 'like', value: '%test%' },
        { field: 'createdAt', operator: 'gte', value: '2023-01-01' },
      ],
      select: ['id', 'name', 'description'],
      limit: 50,
      offset: 0,
      sort: { name: 'asc' },
    });

    render(<MonacoEditor {...defaultProps} value={complexValue} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', complexValue);
  });

  it('handles malformed JSON value', () => {
    const malformedValue = '{"test": "value"'; // Missing closing brace

    render(<MonacoEditor {...defaultProps} value={malformedValue} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('data-value', malformedValue);
  });

  it('handles undefined datasourceId', () => {
    render(<MonacoEditor {...defaultProps} datasourceId={undefined} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles empty datasourceId', () => {
    render(<MonacoEditor {...defaultProps} datasourceId="" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles different result types', () => {
    render(<MonacoEditor {...defaultProps} type="Result" />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles undefined onChange', () => {
    render(<MonacoEditor {...defaultProps} onChange={undefined} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('handles undefined placeholder', () => {
    render(<MonacoEditor {...defaultProps} placeholder={undefined} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });
});
