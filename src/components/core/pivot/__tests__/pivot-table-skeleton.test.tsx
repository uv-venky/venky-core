import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { PivotTableSkeleton } from '@/components/core/pivot/pivot-table-skeleton';

describe('PivotTableSkeleton', () => {
  test('should render', async () => {
    render(<PivotTableSkeleton />);
    const skeletons = await screen.findAllByTestId('skeleton');
    expect(skeletons.length).toBe(42);
  });

  test('should render with 1 row and 1 column', async () => {
    render(<PivotTableSkeleton rows={1} columns={1} />);
    const skeletons = await screen.findAllByTestId('skeleton');
    expect(skeletons.length).toBe(9);
  });
});
