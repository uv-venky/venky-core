/** Hex, RGB(A), HSL(A) strings, or named colors */
type Color = string;

/** FusionCharts’ permissive boolean (accepts true/false or 0/1) */
type FusionBool = boolean | 0 | 1;

export interface DataPoint {
  /* core */
  value: number | string;
  label?: string;
  displayValue?: string;
  toolText?: string;
  link?: string;
  isSliced?: FusionBool;

  /* show/hide toggles (3.2.2 SR5+) */
  showLabel?: FusionBool;
  showValue?: FusionBool;

  /* colors & borders */
  color?: Color;
  borderColor?: Color;
  hoverColor?: Color;
  hoverAlpha?: number;
  borderHoverColor?: Color;
  borderHoverAlpha?: number;
  borderHoverThickness?: number;

  /* label typography & box (3.5.0+) */
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
  labelLink?: string; // URL
}

export interface ChartAttributes {
  /* ─────────── Titles & prefixes ─────────── */
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

  /* ─────────── Functional toggles ─────────── */
  animation?: FusionBool;
  animationDuration?: number;
  animateClockwise?: FusionBool; // v3.11+ :contentReference[oaicite:0]{index=0}
  alphaAnimation?: FusionBool; // v3.11+ :contentReference[oaicite:1]{index=1}
  showZeroPies?: FusionBool; // include 0-value slices :contentReference[oaicite:2]{index=2}
  showPercentValues?: FusionBool; // % inside labels :contentReference[oaicite:3]{index=3}
  showPercentInToolTip?: FusionBool; // :contentReference[oaicite:4]{index=4}
  showLabels?: FusionBool; // :contentReference[oaicite:5]{index=5}
  showValues?: FusionBool; // :contentReference[oaicite:6]{index=6}
  labelSepChar?: string; // :contentReference[oaicite:7]{index=7}
  clickURL?: string; // :contentReference[oaicite:8]{index=8}
  clickURLOverridesPlotLinks?: FusionBool; // :contentReference[oaicite:9]{index=9}
  plotHighlightEffect?: string; // e.g. "fadeout|alpha=60" :contentReference[oaicite:10]{index=10}
  useDataPlotColorForLabels?: FusionBool; // use slice color in label :contentReference[oaicite:11]{index=11}

  /* ─────────── Doughnut-specific ─────────── */
  /** Explicit inner radius (px) – controls ring thickness */
  doughnutRadius?: number; // :contentReference[oaicite:12]{index=12}
  enableSmartLabels?: FusionBool; // avoids overlap (see SO example) :contentReference[oaicite:13]{index=13}
  startingAngle?: number; // first slice start (deg) :contentReference[oaicite:14]{index=14}
  use3DLighting?: FusionBool; // softer shading :contentReference[oaicite:15]{index=15}

  /* ─────────── Palette & theme ─────────── */
  palette?: 1 | 2 | 3 | 4 | 5;
  paletteColors?: string; // comma-sep hex list :contentReference[oaicite:16]{index=16}
  theme?: 'fint';

  /* ─────────── Plot cosmetics ─────────── */
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
