import type { DataSourceAccess } from './DataSourceAccess';
import type { TableDataSource } from './DataSource';
import type { Attribute } from './Attribute';
export declare const DefaultDataSource: Omit<TableDataSource<any>, 'id' | 'description' | 'tableName' | 'attributes' | 'access' | 'externalType' | 'externalId'>;
export declare const DefaultAttribute: Omit<Attribute<any>, 'code' | 'name'>;
export declare const DefaultCalculatedAttribute: Omit<Attribute<any>, 'code' | 'name'>;
export declare const DefaultFullAccess: Omit<DataSourceAccess, 'roleCode'>;
export declare const DefaultReadOnlyAccess: Omit<DataSourceAccess, 'roleCode'>;
//# sourceMappingURL=Defaults.d.ts.map