import type { DataSource } from '../types';
interface DataSourceTabProps {
    selectedDS: DataSource;
    filter?: Show;
}
export type Show = 'primary' | 'who' | 'required' | 'all';
export declare const WHO_ATTRIBUTES: string[];
export declare function getWhoAttributesCount(ds?: DataSource): number;
export declare function isMissingPrimaryKey(ds?: DataSource): boolean;
export declare function DataSourceTab({ selectedDS, filter }: DataSourceTabProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=datasource-tab.d.ts.map