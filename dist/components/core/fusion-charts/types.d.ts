/** Hex, RGB(A), HSL(A) strings, or named colors */
type Color = string;
/** FusionCharts’ permissive boolean (accepts true/false or 0/1) */
type FusionBool = boolean | 0 | 1;
export interface DataPoint {
    value: number | string;
    label?: string;
    displayValue?: string;
    toolText?: string;
    link?: string;
    isSliced?: FusionBool;
    showLabel?: FusionBool;
    showValue?: FusionBool;
    color?: Color;
    borderColor?: Color;
    hoverColor?: Color;
    hoverAlpha?: number;
    borderHoverColor?: Color;
    borderHoverAlpha?: number;
    borderHoverThickness?: number;
    labelFont?: string;
    labelFontColor?: Color;
    labelFontSize?: number;
    labelFontBold?: FusionBool;
    labelFontItalic?: FusionBool;
    labelBgColor?: Color;
    labelBorderColor?: Color;
    labelAlpha?: number;
    labelBgAlpha?: number;
    labelBorderAlpha?: number;
    labelBorderPadding?: number;
    labelBorderRadius?: number;
    labelBorderThickness?: number;
    labelBorderDashed?: FusionBool;
    labelBorderDashLen?: number;
    labelBorderDashGap?: number;
    labelLink?: string;
}
export interface ChartAttributes {
    caption?: string;
    subCaption?: string;
    numberPrefix?: string;
    bgColor?: Color;
    baseFontColor?: Color;
    bgAlpha?: number;
    showBorder?: FusionBool;
    borderColor?: Color;
    canvasBgColor?: Color;
    canvasBgAlpha?: number;
    showCanvasBg?: FusionBool;
    showCanvasBase?: FusionBool;
    xAxisName?: string;
    yAxisName?: string;
    xAxisMaxValue?: number;
    xAxisMinValue?: number;
    yAxisMaxValue?: number;
    yAxisMinValue?: number;
    numberSuffix?: string;
    sYAxisName?: string;
    sYAxisMaxValue?: number;
    sYAxisMinValue?: number;
    showLegend?: FusionBool;
    legendPosition?: 'left' | 'right' | 'top' | 'bottom';
    legendBgColor?: Color;
    legendBgAlpha?: number;
    legendBorderColor?: Color;
    legendBorderAlpha?: number;
    legendBorderThickness?: number;
    legendItemFontColor?: Color;
    animation?: FusionBool;
    animationDuration?: number;
    animateClockwise?: FusionBool;
    alphaAnimation?: FusionBool;
    showZeroPies?: FusionBool;
    showPercentValues?: FusionBool;
    showPercentInToolTip?: FusionBool;
    showLabels?: FusionBool;
    showValues?: FusionBool;
    labelSepChar?: string;
    clickURL?: string;
    clickURLOverridesPlotLinks?: FusionBool;
    plotHighlightEffect?: string;
    useDataPlotColorForLabels?: FusionBool;
    /** Explicit inner radius (px) – controls ring thickness */
    doughnutRadius?: number;
    enableSmartLabels?: FusionBool;
    startingAngle?: number;
    use3DLighting?: FusionBool;
    palette?: 1 | 2 | 3 | 4 | 5;
    paletteColors?: string;
    theme?: 'fint';
    showPlotBorder?: FusionBool;
    plotBorderColor?: Color;
    plotBorderThickness?: number;
    plotBorderAlpha?: number;
    plotFillAlpha?: number;
    toolTipBgColor?: Color;
    toolTipColor?: Color;
    showToolTipShadow?: FusionBool;
    tooltipBorderAlpha?: number;
}
export interface FusionChartProps {
    type: 'doughnut3d' | 'column3d' | 'bar3d' | 'mscombi3d' | 'mscolumn3dlinedy';
    data?: DataPoint[];
    className?: string;
    chart?: ChartAttributes;
    dataset?: DatasetSeries[];
    categories?: CategorySet[];
}
export interface Category {
    label: string;
}
export interface CategorySet {
    category: Category[];
}
/** A single series within `dataset` */
export interface DatasetSeries {
    seriesName: string;
    renderAs?: 'line' | 'area' | 'bar';
    showValues?: FusionBool;
    parentYAxis?: 'S' | 'P';
    /** Array must align index-for-index with the `category` labels */
    data: DataPoint[];
}
export {};
//# sourceMappingURL=types.d.ts.map