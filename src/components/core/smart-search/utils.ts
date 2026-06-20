import { type FilterEntry, splitFilter } from '@/lib/core/common/ds/types/filter';

export function isStickyFilter<T>(f: FilterEntry<T>, stickyFilters?: (keyof T)[]): boolean {
  return !!stickyFilters?.includes(splitFilter(f).attributeCode);
}
