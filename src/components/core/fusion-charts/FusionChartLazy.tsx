/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { lazy, Suspense, type ComponentProps } from 'react';
import type { FusionChartProps } from '@/components/core/fusion-charts/types';

const FusionChartLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted/30">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Lazy-loaded FusionChart component.
 * This significantly reduces the initial bundle size by deferring
 * the loading of react-fusioncharts and FusionCharts libraries.
 */
const LazyFusionChartInner = lazy(() => import('./FusionChart'));

function LazyFusionChart(props: ComponentProps<typeof LazyFusionChartInner>) {
  return (
    <Suspense fallback={<FusionChartLoading />}>
      <LazyFusionChartInner {...props} />
    </Suspense>
  );
}

export { LazyFusionChart };
export type { FusionChartProps };
