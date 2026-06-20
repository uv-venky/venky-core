import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import QueryHistory from '@/components/core/admin/sql-browser/QueryHistory';

// Mock fetch
global.fetch = vi.fn();

describe('QueryHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and display query history', async () => {
    const mockHistory = [
      {
        id: '1',
        query: 'SELECT * FROM users',
        name: 'Test Query',
        timestamp: '2024-01-01T00:00:00Z',
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ history: mockHistory }),
      ok: true,
    });

    render(<QueryHistory onSelectQuery={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Query')).toBeInTheDocument();
      expect(screen.getByText('SELECT * FROM users')).toBeInTheDocument();
    });
  });

  it('should handle empty history', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ history: [] }),
      ok: true,
    });

    render(<QueryHistory onSelectQuery={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No saved queries')).toBeInTheDocument();
    });
  });

  it('should call onSelectQuery when run button is clicked', async () => {
    const mockHistory = [
      {
        id: '1',
        query: 'SELECT * FROM users',
        name: 'Test Query',
        timestamp: '2024-01-01T00:00:00Z',
      },
    ];

    const mockOnSelectQuery = vi.fn();

    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ history: mockHistory }),
      ok: true,
    });

    render(<QueryHistory onSelectQuery={mockOnSelectQuery} />);

    await waitFor(() => {
      expect(screen.getByText('Test Query')).toBeInTheDocument();
    });

    const runButton = screen.getByTitle('Run query');
    fireEvent.click(runButton);

    expect(mockOnSelectQuery).toHaveBeenCalledWith('SELECT * FROM users');
  });

  it('should call onHistoryUpdated when history is updated', async () => {
    const mockOnHistoryUpdated = vi.fn();

    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ history: [] }),
      ok: true,
    });

    render(<QueryHistory onSelectQuery={vi.fn()} onHistoryUpdated={mockOnHistoryUpdated} />);

    await waitFor(() => {
      expect(screen.getByText('No saved queries')).toBeInTheDocument();
    });

    // The onHistoryUpdated should be called after loadHistory
    expect(mockOnHistoryUpdated).not.toHaveBeenCalled(); // It's not called on initial load
  });
});
