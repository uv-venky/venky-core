import type { ClientAttribute } from '@/lib/core/common/ds/types/Attribute';
import type { DataSourceAccess } from '@/lib/core/common/ds/types/DataSourceAccess';

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

export const generateQueryTypes = (attributes: DataSource['attributes']) => {
  const attributeTypes = attributes
    .map((attr) => {
      let type = 'string';
      switch (attr.type) {
        case 'Number':
          type = 'number';
          break;
        case 'Boolean':
          type = 'boolean';
          break;
        case 'Date':
          type = 'string'; // ISO date string
          break;
        case 'JSON':
          type = 'any';
          break;
        default:
          type = 'string';
      }
      return `  ${attr.code}: ${type};`;
    })
    .join('\n');

  return `
interface DataSourceAttributes {
${attributeTypes}
}
declare global {
  const query: QueryOptions;
}
`;
};
