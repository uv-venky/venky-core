import type { DataSource } from '../../../../lib/core/common/ds/types/DataSource';
declare global {
    var _$venkyDataSources: Map<string, DataSource<any>> | undefined;
    var _$venkyDataSourcesVersion: number | undefined;
}
/**
 * Clears the DataSource cache and reloads core DataSources in dev mode.
 * This allows hot-reloading of DataSource definitions without server restart.
 */
export declare function clearDataSourceCache(): Promise<void>;
/**
 * Adds DataSources to the global registry.
 * @param ds - Record of DataSource definitions to add
 * @param options - Options for adding DataSources
 * @param options.reload - If true, clears and reloads all DataSources (useful for dev mode hot-reload)
 */
export declare function addDataSources(ds: Record<string, DataSource<any>>, options?: {
    reload?: boolean;
}): Promise<void>;
export declare function getDataSource<T extends object>(id: string): DataSource<T>;
export declare function getAllDataSources(): Record<string, DataSource<any>>;
//# sourceMappingURL=ds.d.ts.map