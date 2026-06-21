import type { ClientAttribute } from '../../../../../lib/core/common/ds/types/Attribute';
import type { DataSourceAccess } from '../../../../../lib/core/common/ds/types/DataSourceAccess';
export interface DataSource {
  id: string;
  type: string;
  description?: string;
  readOnly?: boolean;
  attributes: Array<ClientAttribute<any>>;
  access: Array<DataSourceAccess>;
}
export interface ApiResponse {
  status: string;
  rows?: any[];
  count?: number;
  elapsed?: number;
  sql?: string;
  params?: any[];
  message?: string;
}
export declare const generateQueryTypes: (attributes: DataSource['attributes']) => string;
//# sourceMappingURL=types.d.ts.map
