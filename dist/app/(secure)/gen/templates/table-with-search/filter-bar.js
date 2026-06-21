import { camelCase, startCase } from 'lodash-es';
export default ({ dsName, moduleCode, editable }) => {
  const dsTitle = startCase(camelCase(dsName));
  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Suspended } ${'from'} '@/components/core/common';
import { ColumnViewsDialog } ${'from'} '@/components/core/page';
import { Filters } ${'from'} '@/components/core/page';${editable ? `\nimport { Button } ${'from'} '@/components/ui/button';` : ''}
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode}/${dsName}';
import type {  Store } ${'from'} '@/lib/core/common/types/Store';
import type { Table } ${'from'} '@tanstack/react-table';${editable ? `\nimport { PlusIcon } ${'from'} 'lucide-react';` : ''}
import { Suspense } ${'from'} 'react';
import use${dsName}SmartSearchColumns ${'from'} '../hooks/smart-search-columns';

export function ${dsName}FilterBar({
  store,
  table,
  pageId,
  itemId,
  ${editable ? 'addNewClick,' : ''}
}: {
  store: Store<${dsName}>;
  table: Table<${dsName}>;
  pageId: string;
  itemId: string;
  ${editable ? 'addNewClick?: () => void;' : ''}
}) {
  const smartSearchColumns = use${dsName}SmartSearchColumns();

  return (
    <Suspense fallback={<Suspended name="Filters" />}>
      <div className="flex shrink-0 items-center gap-2">
        <Filters
          border="full"
          columns={smartSearchColumns}
          itemId={itemId}
          pageId={pageId}
          roundedCorners
          store={store}
          table={table}
        />
        <ColumnViewsDialog table={table as unknown as Table<object>} variant="ghost" />
        ${
          editable
            ? `{addNewClick && (<div className="flex shrink-0 items-center gap-2">
          <Button variant="default" onClick={addNewClick}>
            <PlusIcon className="h-4 w-4" />
            Add New ${dsTitle}
            </Button>
          </div>)}`
            : ''
        }
      </div>
    </Suspense>
  );
}
`;
};
//# sourceMappingURL=filter-bar.js.map
