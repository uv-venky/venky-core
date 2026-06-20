/* Copyright (c) 2024-present Venky Corp. */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/empty-state';

describe('EmptyState', () => {
  it('renders the empty state component with default action label', () => {
    render(<EmptyState />);

    expect(screen.getByText('Ready to Execute')).toBeInTheDocument();
    expect(screen.getByText(/Write your query and click/)).toBeInTheDocument();
    expect(screen.getByText('Execute')).toBeInTheDocument();
  });

  it('renders with custom action label', () => {
    render(<EmptyState actionLabel="Run Query" />);

    expect(screen.getByText('Ready to Run Query')).toBeInTheDocument();
    expect(screen.getByText('Run Query')).toBeInTheDocument();
  });

  it('has the correct container styling', () => {
    const { container } = render(<EmptyState />);

    // Check the main container has proper styling classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('h-full');
    expect(mainContainer).toHaveClass('min-h-[300px]');
    expect(mainContainer).toHaveClass('w-full');
    expect(mainContainer).toHaveClass('flex-col');
    expect(mainContainer).toHaveClass('items-center');
    expect(mainContainer).toHaveClass('justify-center');
  });

  it('renders with proper structure', () => {
    const { container } = render(<EmptyState />);

    // Should have background pattern (svg element)
    const svgPattern = container.querySelector('svg');
    expect(svgPattern).toBeInTheDocument();

    // Should have the main content container with z-10
    const contentContainer = container.querySelector('.z-10');
    expect(contentContainer).toBeInTheDocument();
  });

  it('renders decorative icon elements', () => {
    const { container } = render(<EmptyState />);

    // Should have animated ping effect
    const pingElement = container.querySelector('.animate-ping');
    expect(pingElement).toBeInTheDocument();

    // Should have spinning border gradient
    const spinElement = container.querySelector('[class*="animate-[spin"]');
    expect(spinElement).toBeInTheDocument();

    // Should have bouncing decorative elements
    const bounceElements = container.querySelectorAll('.animate-bounce');
    expect(bounceElements.length).toBeGreaterThan(0);
  });

  it('has proper accessibility structure', () => {
    render(<EmptyState />);

    // The heading should be present
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Ready to Execute');
  });

  it('has gradient orbs for visual effect', () => {
    const { container } = render(<EmptyState />);

    // Should have gradient orb elements with blur
    const blurElements = container.querySelectorAll('.blur-3xl');
    expect(blurElements.length).toBe(2);
  });

  it('has proper text content structure', () => {
    render(<EmptyState />);

    // Main heading
    expect(screen.getByText('Ready to Execute')).toHaveClass('font-semibold', 'text-lg');

    // Subtext with highlighted action label
    const highlightedText = screen.getByText('Execute');
    expect(highlightedText).toHaveClass('font-medium');
  });
});
