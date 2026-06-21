/**
 * Static sample data for pivot table testing.
 * 5 dimensions: region, category, product, year, channel
 * 4 fact values: quantity (count/sum), revenue (sum), units (sum), recordCount (1 per row for record count)
 */
export interface SalesRecord {
  region: string;
  category: string;
  product: string;
  year: number;
  channel: string;
  quantity: number | string;
  revenue: number | string;
  units: number | string;
  rating: number | string;
  sales: number | string;
  reviews: number | string;
  /** Always 1 - use Sum aggregator to get record count */
  recordCount: number | string;
  date: string;
}
export type SalesColumnKey = keyof SalesRecord;
/** Generate diverse sample data for pivot testing */
export declare const STATIC_SAMPLE_DATA: SalesRecord[];
//# sourceMappingURL=static-sample-data.d.ts.map
