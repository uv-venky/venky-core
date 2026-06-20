'use client';

import { useMemo } from 'react';
import type { PivotColumn } from '@/components/core/pivot/PivotTypes';
import type { SalesColumnKey } from './static-sample-data';

export default function useStaticPivotColumns(): PivotColumn<SalesColumnKey>[] {
  return useMemo(
    (): PivotColumn<SalesColumnKey>[] => [
      { key: 'region', label: 'Region', dataType: 'Text' },
      { key: 'category', label: 'Category', dataType: 'Text' },
      { key: 'product', label: 'Product', dataType: 'Text' },
      { key: 'year', label: 'Year', dataType: 'Text' },
      { key: 'channel', label: 'Channel', dataType: 'Text' },
      { key: 'date', label: 'Date', dataType: 'Date' },
      { key: 'quantity', label: 'Quantity', dataType: 'Number' },
      { key: 'revenue', label: 'Revenue', dataType: 'Number' },
      { key: 'sales', label: 'Sales', dataType: 'Number', allowDecimals: false },
      { key: 'units', label: 'Units', dataType: 'Number' },
      { key: 'recordCount', label: 'Record Count', dataType: 'Number' },
    ],
    [],
  );
}
