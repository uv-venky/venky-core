/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, test } from 'vitest';
import { shouldExecuteSmartSearchQuery } from '@/components/core/page/filters';

describe('shouldExecuteSmartSearchQuery', () => {
  test('re-queries when the last filter is removed via search-blur', () => {
    expect(shouldExecuteSmartSearchQuery([], 'search-blur')).toBe(true);
  });

  test('re-queries when all filters are cleared', () => {
    expect(shouldExecuteSmartSearchQuery([], 'clear-filters')).toBe(true);
  });

  test('re-queries when filters remain after search-blur', () => {
    expect(shouldExecuteSmartSearchQuery([{ roleCode: { is: 'admin' } }], 'search-blur')).toBe(true);
  });

  test('does not re-query for saved-search-deactivation with no filters', () => {
    expect(shouldExecuteSmartSearchQuery([], 'saved-search-deactivated')).toBe(false);
  });
});
