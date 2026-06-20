import { kebabCase } from 'lodash-es';
import type { State } from '../../types';

export default ({ dsName, moduleCode, template }: State): string => {
  const alias = kebabCase(dsName);

  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode}/${dsName}';
import { useStore } ${'from'} '@/lib/core/client/store';

export function use${dsName}Store() {
  return useStore<${dsName}>({
    datasourceId: '${dsName}',
    page: '${alias}-page',
    alias: '${alias}-all',
    limit: 20,
    includeCount: true,${template === 'drill-down' ? '\n    ignorePKDuplicate: true,' : ''}
    autoQuery: ${template === 'drill-down' ? 'false' : 'true'},
    // onInitialized: async (store) => {
    //   // if the autoQuery is false, we need to set the loading to false manually if the 
    //   // store is not programmatically loading any data
    //   // otherwise, the table will show loading state even until the first query is fired
    //   store.setIsLoading(false);
    // },
  });
}
`;
};
