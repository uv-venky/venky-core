import { getAttributes } from '../../utils';
import { PREFIX } from '../../../../../lib/server/constants';
export default ({ index, tableName, dsName, columns, moduleCode, schemaName }) => {
    let tableNameWithPrefix = `'${tableName}'`;
    let includePrefix = false;
    if (tableName.startsWith(PREFIX)) {
        tableNameWithPrefix = `\`\${PREFIX}${tableName.replace(PREFIX, '')}\``;
        includePrefix = true;
    }
    const attributes = getAttributes(columns, index);
    return `/* Copyright (c) 2024-present Venky Corp. */

import type {  DataSource } ${'from'} '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } ${'from'} '@/lib/core/common/ds/types/Defaults';
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode ? `${moduleCode}/` : ''}${dsName}';
${includePrefix ? `import { PREFIX } ${'from'} '@/lib/server/constants';` : ''}

export const ${dsName}DS: DataSource<${dsName}> = {
  ...DefaultDataSource,
  id: '${dsName}',
  tableName: ${tableNameWithPrefix},${schemaName && schemaName !== 'default' ? `\n  schema: '${schemaName}',` : ''}
  attributes: [${attributes}],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
  // preQuery: async ({ query, session }) => {
  //   const customerName = checkAndGetCustomerName(session);
  //   query.match = { ...query.match, customerName };
  //   return query;
  // },
};
`;
};
//# sourceMappingURL=ds.js.map