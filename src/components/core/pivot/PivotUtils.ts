/* Copyright (c) 2024-present VENKY Corp. */

import type {
  CollapsedRange,
  ItemData,
  PivotItemData,
  PivotItemDataInternal,
  SortFn,
} from '@/components/core/pivot/PivotTypes';
import { BOTH_SPAN, COL_SPAN, ROW_SPAN } from '@/components/core/pivot/PivotTypes';

const SEPARATOR = 'x';
export type SorterDirection = 1 | -1;
export type SorterConfig = SortFn | SorterDirection;

export function makeKey({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }): string {
  return `${rowIndex}${SEPARATOR}${columnIndex}`;
}

export function parseKey(key: string): [number, number] {
  const [rowIndex, columnIndex] = key.split(SEPARATOR);
  return [Number(rowIndex), Number(columnIndex)];
}

const addSeparators = (nStr: number | string, thousandsSep: string, decimalSep: string) => {
  const x = String(nStr).split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? decimalSep + x[1] : '';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, `$1${thousandsSep}$2`);
  }
  return x1 + x2;
};

const numberFormat = (opts_in?: {
  digitsAfterDecimal?: number;
  scaler?: number;
  thousandsSep?: string;
  decimalSep?: string;
  prefix?: string;
  suffix?: string;
}) => {
  const defaults = {
    digitsAfterDecimal: 2,
    scaler: 1,
    thousandsSep: ',',
    decimalSep: '.',
    prefix: '',
    suffix: '',
  };
  const opts = { ...defaults, ...opts_in };
  return (x: number) => {
    if (Number.isNaN(x) || !Number.isFinite(x)) {
      return '';
    }
    const result = addSeparators(
      (opts.scaler * x).toFixed(opts.digitsAfterDecimal),
      opts.thousandsSep,
      opts.decimalSep,
    );
    return `${opts.prefix}${result}${opts.suffix}`;
  };
};

const rx = /(\d+)|(\D+)/g;
const rd = /\d/;
const rz = /^0/;

const naturalSort = (as: unknown, bs: unknown): number => {
  // nulls first
  if (bs !== null && as === null) {
    return -1;
  }
  if (as !== null && bs === null) {
    return 1;
  }

  // then raw NaNs
  if (typeof as === 'number' && Number.isNaN(as)) {
    return -1;
  }
  if (typeof bs === 'number' && Number.isNaN(bs)) {
    return 1;
  }

  // numbers and nummary strings group together
  const nas = Number(as);
  const nbs = Number(bs);
  if (nas < nbs) {
    return -1;
  }
  if (nas > nbs) {
    return 1;
  }

  // within that, true numbers before nummary strings
  if (typeof as === 'number' && typeof bs !== 'number') {
    return -1;
  }
  if (typeof bs === 'number' && typeof as !== 'number') {
    return 1;
  }
  if (typeof as === 'number' && typeof bs === 'number') {
    return 0;
  }

  // 'Infinity' is a textual number, so less than 'A'
  if (Number.isNaN(nbs) && !Number.isNaN(nas)) {
    return -1;
  }
  if (Number.isNaN(nas) && !Number.isNaN(nbs)) {
    return 1;
  }

  // finally, "smart" string sorting per http://stackoverflow.com/a/4373421/112871
  const a = String(as);
  const b = String(bs);
  if (a === b) {
    return 0;
  }
  if (!rd.test(a) || !rd.test(b)) {
    return a.localeCompare(b);
  }

  // special treatment for strings containing digits
  const aa = a.match(rx);
  const bb = b.match(rx);
  while (aa?.length && bb?.length) {
    const a1 = aa.shift();
    const b1 = bb.shift();
    if (a1 != null && b1 != null && a1 !== b1) {
      if (rd.test(a1) && rd.test(b1)) {
        return a1.replace(rz, '.0').localeCompare(b1.replace(rz, '.0'));
      }
      return a1 > b1 ? 1 : -1;
    }
  }
  return a.length - b.length;
};

export const getSort = <TColumnKey extends string>(
  sorters: Partial<Record<TColumnKey, SorterConfig>>,
  attr: TColumnKey,
): ((as: unknown, bs: unknown) => number) => {
  const sorter = sorters?.[attr];
  if (sorter == null) {
    return naturalSort;
  }
  if (typeof sorter === 'function') {
    return sorter;
  }

  const direction: SorterDirection = sorter === -1 ? -1 : 1;

  return (as: unknown, bs: unknown): number => {
    const aTime = getDateTimestamp(as);
    const bTime = getDateTimestamp(bs);
    const comparison = aTime != null && bTime != null ? aTime - bTime : naturalSort(as, bs);
    return comparison * direction;
  };
};

function getDateTimestamp(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  // Keep date parsing opt-in for date-like strings to avoid false positives.
  if (!/[-/:T]/.test(trimmed)) {
    return null;
  }

  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

// aggregator templates default to US number formatting but this is overridable
const usFmt = numberFormat();
const usFmtInt = numberFormat({ digitsAfterDecimal: 0 });

type Formatter = (x: number, valueIndex?: number) => string;
export interface Aggregator<TItem> {
  push: (record: Readonly<TItem>) => void;
  values: () => Array<number>;
  /** Format a value. When valueIndex is provided, per-value aggregators use the formatter for that column (e.g. integer for Count). */
  format: Formatter;
}

interface Props<TColumnKey, TItem> {
  attrs: Array<TColumnKey>;
  getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number;
  getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string;
}

/**
 * Marker displayed when an aggregated value includes suppressed/redacted data.
 * When getNumberValue returns NaN for a record, the aggregation is "tainted"
 * and this marker is shown instead of a numeric result (e.g. 22 + '*' = '*').
 */
export const SUPPRESSED_MARKER = '*';

const aggregatorTemplates: Record<
  string,
  (formatter: Formatter) => <TColumnKey, TItem>(props: Props<TColumnKey, TItem>) => () => Aggregator<TItem>
> = {
  count(formatter = usFmtInt) {
    return <TColumnKey, TItem>({
      attrs,
      getTextValue,
      getNumberValue,
    }: Props<TColumnKey, TItem>): (() => Aggregator<TItem>) => {
      return () => {
        const count = attrs.map(() => 0);
        const tainted = attrs.map(() => false);
        return {
          push(record) {
            attrs.forEach((attr, index) => {
              if (Number.isNaN(getNumberValue(record, attr))) {
                tainted[index] = true;
              }
              const value = getTextValue(record, attr);
              if (value != null && value !== '') {
                count[index] += 1;
              }
            });
          },
          values() {
            return count;
          },
          format(x: number, valueIndex?: number) {
            if (tainted[valueIndex ?? 0]) return SUPPRESSED_MARKER;
            return formatter(x);
          },
        };
      };
    };
  },

  uniqueCount(formatter = usFmtInt) {
    return <TColumnKey, TItem>({
      attrs,
      getTextValue,
      getNumberValue,
    }: Props<TColumnKey, TItem>): (() => Aggregator<TItem>) => {
      return () => {
        const uniq: Array<Set<unknown>> = attrs.map(() => new Set());
        const tainted = attrs.map(() => false);
        return {
          push(record) {
            attrs.forEach((attr, index) => {
              if (Number.isNaN(getNumberValue(record, attr))) {
                tainted[index] = true;
              }
              const val = getTextValue(record, attr);
              if (!uniq[index].has(val)) {
                uniq[index].add(val);
              }
            });
          },
          values() {
            return uniq.map((set) => set.size);
          },
          format(x: number, valueIndex?: number) {
            if (tainted[valueIndex ?? 0]) return SUPPRESSED_MARKER;
            return formatter(x);
          },
        } as Aggregator<TItem>;
      };
    };
  },

  sum(formatter = usFmt) {
    return <TColumnKey, TItem>({ attrs, getNumberValue }: Props<TColumnKey, TItem>): (() => Aggregator<TItem>) =>
      () => {
        const sum = attrs.map(() => 0);
        const tainted = attrs.map(() => false);
        return {
          push(record) {
            attrs.forEach((attr, index) => {
              const value = getNumberValue(record, attr);
              if (Number.isNaN(value)) {
                tainted[index] = true;
              } else {
                sum[index] += value;
              }
            });
          },
          values() {
            return sum;
          },
          format(x: number, valueIndex?: number) {
            if (tainted[valueIndex ?? 0]) return SUPPRESSED_MARKER;
            return formatter(x);
          },
        } satisfies Aggregator<TItem>;
      };
  },

  max(formatter = usFmt) {
    return <TColumnKey, TItem>({ attrs, getNumberValue }: Props<TColumnKey, TItem>): (() => Aggregator<TItem>) =>
      () => {
        const maxVal = attrs.map(() => Number.MIN_VALUE);
        const tainted = attrs.map(() => false);
        return {
          push(record) {
            attrs.forEach((attr, index) => {
              const val = getNumberValue(record, attr);
              if (Number.isNaN(val)) {
                tainted[index] = true;
              } else {
                maxVal[index] = Math.max(val, maxVal[index] !== Number.MIN_VALUE ? maxVal[index] : val);
              }
            });
          },
          values() {
            return maxVal;
          },
          format(x: number, valueIndex?: number) {
            if (tainted[valueIndex ?? 0]) return SUPPRESSED_MARKER;
            if (Number.isNaN(x)) return '';
            return formatter(x);
          },
        } satisfies Aggregator<TItem>;
      };
  },

  min(formatter = usFmt) {
    return <TColumnKey, TItem>({ attrs, getNumberValue }: Props<TColumnKey, TItem>): (() => Aggregator<TItem>) =>
      () => {
        const minVal = attrs.map(() => Number.MAX_VALUE);
        const tainted = attrs.map(() => false);
        return {
          push(record) {
            attrs.forEach((attr, index) => {
              const val = getNumberValue(record, attr);
              if (Number.isNaN(val)) {
                tainted[index] = true;
              } else {
                minVal[index] = Math.min(val, minVal[index] !== Number.MAX_VALUE ? minVal[index] : val);
              }
            });
          },
          values() {
            return minVal;
          },
          format(x: number, valueIndex?: number) {
            if (tainted[valueIndex ?? 0]) return SUPPRESSED_MARKER;
            if (Number.isNaN(x)) return '';
            return formatter(x);
          },
        } as Aggregator<TItem>;
      };
  },

  avg(formatter = usFmt) {
    return <TColumnKey, TItem>({ attrs, getNumberValue }: Props<TColumnKey, TItem>): (() => Aggregator<TItem>) =>
      () => {
        const totalVal = attrs.map(() => 0);
        const count = attrs.map(() => 0);
        const tainted = attrs.map(() => false);
        return {
          push(record) {
            attrs.forEach((attr, index) => {
              const val = getNumberValue(record, attr);
              if (Number.isNaN(val)) {
                tainted[index] = true;
              } else {
                count[index]++;
                totalVal[index] += val;
              }
            });
          },
          values() {
            return attrs.map((_, index) => (count[index] > 0 ? totalVal[index] / count[index] : 0));
          },
          format(x: number, valueIndex?: number) {
            if (tainted[valueIndex ?? 0]) return SUPPRESSED_MARKER;
            if (Number.isNaN(x)) return '';
            return formatter(x);
          },
        } as Aggregator<TItem>;
      };
  },
};

export type AggregatorNames = 'Count' | 'Sum' | 'Average' | 'Minimum' | 'Maximum' | 'Unique Count' | 'Integer Sum';

/**
 * Creates a composite aggregator that applies different aggregation types per value column.
 * Use when valueAggregators is provided (e.g. Sum for revenue, Count for recordCount).
 */
export function createCompositeAggregator<TColumnKey extends string, TItem>(props: {
  values: Array<TColumnKey>;
  valueAggregators: Partial<Record<TColumnKey, AggregatorNames>>;
  defaultAggregator: AggregatorNames;
  getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number;
  getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string;
}): () => Aggregator<Readonly<TItem>> {
  const { values, valueAggregators, defaultAggregator, getNumberValue, getTextValue } = props;
  const subFactories = values.map((v) => {
    const name = valueAggregators[v] ?? defaultAggregator;
    return aggregators[name]({ attrs: [v], getNumberValue, getTextValue });
  });

  return () => {
    const subAggregators = subFactories.map((fn) => fn());
    return {
      push(record) {
        for (const sub of subAggregators) {
          sub.push(record);
        }
      },
      values() {
        return subAggregators.map((sub) => sub.values()[0]);
      },
      format(x: number, valueIndex?: number) {
        const idx = valueIndex ?? 0;
        return subAggregators[idx].format(x);
      },
    };
  };
}

import type { FormulaOperation } from '@/components/core/pivot/PivotTypes';

/**
 * Compute aggregation on a column. Returns NaN if any record has a suppressed
 * value (getNumberValue returns NaN), propagating the tainted state through
 * calculated columns.
 */
export function computeAggregation<TColumnKey extends string, TItem>(
  operation: FormulaOperation,
  column: TColumnKey,
  records: ReadonlyArray<Readonly<TItem>>,
  getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number,
  getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string,
): number {
  if (records.length === 0) {
    return 0;
  }

  switch (operation) {
    case 'sum': {
      let sum = 0;
      for (const record of records) {
        const value = getNumberValue(record, column);
        if (Number.isNaN(value)) return Number.NaN;
        if (Number.isFinite(value)) {
          sum += value;
        }
      }
      return sum;
    }
    case 'count': {
      let count = 0;
      for (const record of records) {
        if (Number.isNaN(getNumberValue(record, column))) return Number.NaN;
        const value = getTextValue(record, column);
        if (value != null && value !== '') {
          count++;
        }
      }
      return count;
    }
    case 'uniqueCount': {
      const unique = new Set<string>();
      for (const record of records) {
        if (Number.isNaN(getNumberValue(record, column))) return Number.NaN;
        const value = getTextValue(record, column);
        if (value != null && value !== '') {
          unique.add(String(value));
        }
      }
      return unique.size;
    }
    case 'avg': {
      let sum = 0;
      let count = 0;
      for (const record of records) {
        const value = getNumberValue(record, column);
        if (Number.isNaN(value)) return Number.NaN;
        if (Number.isFinite(value)) {
          sum += value;
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    }
    case 'min': {
      let min = Number.MAX_VALUE;
      let found = false;
      for (const record of records) {
        const value = getNumberValue(record, column);
        if (Number.isNaN(value)) return Number.NaN;
        if (Number.isFinite(value)) {
          min = Math.min(min, value);
          found = true;
        }
      }
      return found ? min : 0;
    }
    case 'max': {
      let max = Number.MIN_VALUE;
      let found = false;
      for (const record of records) {
        const value = getNumberValue(record, column);
        if (Number.isNaN(value)) return Number.NaN;
        if (Number.isFinite(value)) {
          max = Math.max(max, value);
          found = true;
        }
      }
      return found ? max : 0;
    }
    default:
      return 0;
  }
}

// Helper function to compute calculated column value
export function computeCalculatedColumn<TColumnKey extends string, TItem>(
  formula: {
    type: 'aggregation';
    numerator: {
      operation: FormulaOperation;
      column: TColumnKey;
    };
    denominator: {
      operation: FormulaOperation;
      column: TColumnKey;
    };
    mathOperator?: '+' | '-' | '*' | '/' | '%';
    multiplier?: number;
  },
  records: ReadonlyArray<Readonly<TItem>>,
  getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number,
  getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string,
): number {
  const numerator = computeAggregation(
    formula.numerator.operation,
    formula.numerator.column,
    records,
    getNumberValue,
    getTextValue,
  );

  const denominator = computeAggregation(
    formula.denominator.operation,
    formula.denominator.column,
    records,
    getNumberValue,
    getTextValue,
  );

  let result: number;
  const operator = formula.mathOperator ?? '/';

  switch (operator) {
    case '+':
      result = numerator + denominator;
      break;
    case '-':
      result = numerator - denominator;
      break;
    case '*':
      result = numerator * denominator;
      break;
    case '/':
      result = denominator !== 0 ? numerator / denominator : 0;
      break;
    case '%':
      result = denominator !== 0 ? (numerator / denominator) * 100 : 0;
      break;
    default:
      result = denominator !== 0 ? numerator / denominator : 0;
  }

  if (formula.multiplier) {
    result *= formula.multiplier;
  }

  return result;
}

// default aggregators & renderers use US naming and number formatting
export const aggregators: Record<
  AggregatorNames,
  <TColumnKey, TItem>(props: Props<TColumnKey, TItem>) => () => Aggregator<TItem>
> = {
  Count: aggregatorTemplates.count(usFmtInt),
  'Unique Count': aggregatorTemplates.uniqueCount(usFmtInt),
  Sum: aggregatorTemplates.sum(usFmt),
  'Integer Sum': aggregatorTemplates.sum(usFmtInt),
  Average: aggregatorTemplates.avg(usFmt),
  Minimum: aggregatorTemplates.min(usFmt),
  Maximum: aggregatorTemplates.max(usFmt),
};

export function totalLabel(aggregatorName: AggregatorNames): string {
  // Remove the explicit aggregator name from the total label so we don't render
  // column headers like "Total Sum". We still special‑case the statistical
  // aggregations where the label itself is meaningful (e.g. "Average").
  switch (aggregatorName) {
    case 'Minimum':
    case 'Maximum':
    case 'Average':
      return aggregatorName;
    default:
      return 'Total';
  }
}

export function makePivotItemData<ColumnKey extends string, Item>(
  data: ItemData<PivotItemDataInternal<ColumnKey, Item>>,
): ItemData<PivotItemData<ColumnKey, Item>> {
  const { pivot, getActualColumnIndex, density, getActualRowIndex, columns, header, rows, isRowCollapsed } = data.data;
  const _data: ItemData<PivotItemData<ColumnKey, Item>> = {
    endColumnIndex: data.endColumnIndex,
    endRowIndex: data.endRowIndex,
    startColumnIndex: data.startColumnIndex,
    startRowIndex: data.startRowIndex,
    data: {
      pivot,
      getActualColumnIndex,
      density,
      getActualRowIndex,
      columns,
      header,
      rows,
      isRowCollapsed,
    },
  };
  return _data;
}

export function compareSpans(a: string, b: string): 1 | -1 | boolean {
  if (a === ROW_SPAN && b === ROW_SPAN) {
    return true;
  } else if (a === ROW_SPAN) {
    return -1;
  } else if (b === ROW_SPAN) {
    return 1;
  }
  if (a === COL_SPAN && b === COL_SPAN) {
    return true;
  } else if (a === COL_SPAN) {
    return -1;
  } else if (b === COL_SPAN) {
    return 1;
  }
  if (a === BOTH_SPAN && b === BOTH_SPAN) {
    return true;
  } else if (a === BOTH_SPAN) {
    return -1;
  } else if (b === BOTH_SPAN) {
    return 1;
  }
  return false;
}

function collectCollapsedIndices(collect: Array<[number, number]>, ranges: Array<CollapsedRange>) {
  ranges.forEach((range) => {
    const { key, nested } = range;
    const [row, col] = parseKey(key);
    collect.push([row, col]);
    if (nested) {
      collectCollapsedIndices(collect, nested);
    }
  });
}

export function getCollapsedIndices(state: Record<string, CollapsedRange>): Array<[number, number]> {
  const collect: Array<[number, number]> = [];
  Object.keys(state).forEach((key) => {
    const [row, col] = parseKey(key);
    collect.push([row, col]);
    const { nested } = state[key];
    if (nested) {
      collectCollapsedIndices(collect, nested);
    }
  });
  return collect;
}

let size: number;

export function getScrollbarSize(recalc = false) {
  if ((!size && size !== 0) || recalc) {
    const scrollDiv = document.createElement('div');

    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    scrollDiv.style.width = '50px';
    scrollDiv.style.height = '50px';
    scrollDiv.style.overflow = 'scroll';

    document.body.appendChild(scrollDiv);
    size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
  }

  return size;
}
