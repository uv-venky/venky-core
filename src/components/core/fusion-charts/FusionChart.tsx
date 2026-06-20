import ReactFC from 'react-fusioncharts';
import useAutoSizer from '@/components/core/hooks/useAutoSizer';
import useFusionLoader from '@/components/core/fusion-charts/useFusionLoader';
import { cn } from '@/lib/utils';
import type { ChartAttributes, FusionChartProps } from '@/components/core/fusion-charts/types';
import { useMemo } from 'react';
import useTheme from '@/components/core/hooks/useTheme';

export default function FusionChart({ type, data, className, chart, dataset, categories }: FusionChartProps) {
  const { width, height, Container } = useAutoSizer();
  const { theme } = useTheme();

  const loaded = useFusionLoader();
  const dataSource = useMemo(() => {
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#09090b' : '#FFFFFF';
    const fontColor = isDark ? '#FFFFFF' : '#000000';
    const chartAttributes: ChartAttributes = {
      theme: 'fint',
      bgColor,
      canvasBgColor: bgColor,
      showCanvasBase: false,
      showCanvasBg: false,
      baseFontColor: fontColor,
      legendBgAlpha: 0,
      legendBorderThickness: 0,
      legendItemFontColor: fontColor,
      animation: false,
      toolTipBgColor: bgColor,
      toolTipColor: fontColor,
      showToolTipShadow: false,
      ...chart,
    };
    return {
      chart: chartAttributes,
      data,
      dataset,
      categories,
    };
  }, [chart, data, dataset, categories, theme]);

  return (
    <Container className={cn('absolute inset-0', className)}>
      {/* @ts-expect-error - ReactFC is a valid JSX component */}
      {loaded && <ReactFC type={type} dataSource={dataSource} width={width} height={height} dataFormat="json" />}
    </Container>
  );
}
