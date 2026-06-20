import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiTesterPage } from '../ApiTesterPage';

// Mock the dependencies
vi.mock('../page-content', () => ({
  ApiTesterContent: () => <div data-testid="api-tester-content">API Tester Content</div>,
}));

vi.mock('../context', () => ({
  ApiTesterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="api-tester-provider">{children}</div>
  ),
}));

vi.mock('@/components/core/page/page-shell', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="page-shell" data-title={title}>
      {children}
    </div>
  ),
}));

describe('ApiTesterPage', () => {
  it('renders the page with correct structure', () => {
    render(<ApiTesterPage />);

    expect(screen.getByTestId('page-shell')).toBeInTheDocument();
    expect(screen.getByTestId('page-shell')).toHaveAttribute('data-title', 'API Playground');
    expect(screen.getByTestId('api-tester-provider')).toBeInTheDocument();
    expect(screen.getByTestId('api-tester-content')).toBeInTheDocument();
  });

  it('passes correct props to PageShell', () => {
    render(<ApiTesterPage />);

    const pageShell = screen.getByTestId('page-shell');
    expect(pageShell).toHaveAttribute('data-title', 'API Playground');
  });
});
