import { jsx as _jsx } from "react/jsx-runtime";
import ReactFC from 'react-fusioncharts';
import useAutoSizer from '../../../components/core/hooks/useAutoSizer';
import useFusionLoader from '../../../components/core/fusion-charts/useFusionLoader';
import { cn } from '../../../lib/utils';
import { useMemo } from 'react';
import useTheme from '../../../components/core/hooks/useTheme';
export default function FusionChart({ type, data, className, chart, dataset, categories }) {
    const { width, height, Container } = useAutoSizer();
    const { theme } = useTheme();
    const loaded = useFusionLoader();
    const dataSource = useMemo(() => {
        const isDark = theme === 'dark';
        const bgColor = isDark ? '#09090b' : '#FFFFFF';
        const fontColor = isDark ? '#FFFFFF' : '#000000';
        const chartAttributes = {
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
    return (_jsx(Container, { className: cn('absolute inset-0', className), children: loaded && _jsx(ReactFC, { type: type, dataSource: dataSource, width: width, height: height, dataFormat: "json" }) }));
}
//# sourceMappingURL=FusionChart.js.map