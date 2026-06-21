import type { PivotColumn } from '../../../../components/core/pivot/PivotTypes';
export type Item = {
  category: string;
  item: string;
  price: number;
  qty: number;
  region: string;
};
export type ColumnKey = keyof Item;
export declare const getTextValue: (item: Readonly<Item>, attr: ColumnKey) => string;
export declare const getNumberValue: (item: Readonly<Item>, attr: ColumnKey) => number;
export declare const TEST_DATA: Array<Item>;
export declare const columns: PivotColumn<ColumnKey>[];
//# sourceMappingURL=test-data.d.ts.map
