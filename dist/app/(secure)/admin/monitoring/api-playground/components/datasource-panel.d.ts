import type { DataSource } from '../types';
interface DataSourceTabProps {
  selectedDataSource: string;
  setSelectedDataSource: (value: string) => void;
  dataSources: DataSource[];
}
export declare function DataSourcePanel({
  selectedDataSource,
  setSelectedDataSource,
  dataSources,
}: DataSourceTabProps): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=datasource-panel.d.ts.map
