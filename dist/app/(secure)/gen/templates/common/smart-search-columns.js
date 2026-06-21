import { camelCase, startCase } from 'lodash-es';
import { getAttributeType, getDefaultOperatorForType } from '../../utils';
export default ({ dsName, moduleCode, columns, columnOrder, index, template }) => {
    let cols = columns
        .filter((c) => columnOrder.includes(c.name))
        .sort((a, b) => columnOrder.indexOf(a.name) - columnOrder.indexOf(b.name));
    cols =
        template === 'drill-down' && moduleCode === 'amazon'
            ? cols.filter((c) => !['state', 'region', 'site_name', 'counter_date', 'customer_name', 'customer_number'].includes(c.name))
            : cols;
    const fields = cols
        .map((column) => {
        const type = getAttributeType(column.type, column.maxLength);
        if (!type || type === 'JSON' || type === 'Polygon' || type === 'Vector') {
            return `      /* Ignored column ${column.name} of type ${column.type}! */\n`;
        }
        const defaultOperator = getDefaultOperatorForType(type);
        return `      {
        key: '${camelCase(column.name)}${index ?? ''}',
        label: '${startCase(camelCase(column.name))}${index ?? ''}',
        type: '${type}',
        defaultOperator: '${defaultOperator}',
      },\n`;
    })
        .join('');
    return `/* Copyright (c) 2024-present Venky Corp. */
  
'use client';

import type { Column } ${'from'} '@/components/core/smart-search/types';
import { useClientSession } ${'from'} '@/components/core/session-context';
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode ? `${moduleCode}/` : ''}${dsName}';
import { useMemo } ${'from'} 'react';

export default function useSmartSearchColumns(): Column<${dsName}>[] {
  const session = useClientSession();
  const roles = session?.roles;
  return useMemo(() => {
    if (!roles) {
      return [];
    }
    // customize columns based on roles etc.
    const columns: Column<${dsName}>[] = [
      ${fields.trim()}
    ];    
    return columns;
  }, [roles]);
}
`;
};
//# sourceMappingURL=smart-search-columns.js.map