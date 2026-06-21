import { camelCase, kebabCase, startCase } from 'lodash-es';
export default ({ dsName, moduleCode, editable }) => {
  const alias = kebabCase(dsName);
  const dsTitle = startCase(camelCase(dsName));
  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

${editable ? `import { EditPopup } ${'from'} '@/components/core/page';` : ''}
import { useTable } ${'from'} '@/components/core/page';
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode}/${dsName}';
${editable ? `import { useState } ${'from'} 'react';` : ''}
${editable ? `import ${dsName}EditForm ${'from'} './edit-form';` : ''}
import { ${dsName}FilterBar } ${'from'} './filter-bar';
import { ${dsName}Table } ${'from'} './table';
import use${dsName}TableColumns ${'from'} '../hooks/table-columns';
import { use${dsName}Store } ${'from'} '../hooks/use-store';
import { Card } ${'from'} '@/components/ui/card';

export default function ${dsName}TableWithSearch() {
  const store = use${dsName}Store();
  const tableColumns = use${dsName}TableColumns(store);
  const table = useTable<${dsName}>({
    store,
    tableColumns,
  });
  ${editable ? `  const [openEditPopup, setOpenEditPopup] = useState(false);` : ''}

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <${dsName}FilterBar
        store={store}
        table={table}
        pageId="${alias}-page"
        itemId="${alias}"
        ${
          editable
            ? `addNewClick={async () => {
          await store.createNew({
            partialRecord: {
              // TODO: add default values here if needed
            },
          });
          setOpenEditPopup(true);
        }}`
            : ''
        }
      />
      <Card className="flex-1 overflow-hidden p-0">
        <${dsName}Table
          store={store}
          table={table}
          ${
            editable
              ? `onRowClick={() => {
          setOpenEditPopup(true);
        }}`
              : ''
          }
        />
      </Card>
      ${
        editable
          ? `{openEditPopup && (
        <EditPopup title="Add New ${dsTitle}" store={store} onClose={() => setOpenEditPopup(false)} modal>
          <${dsName}EditForm store={store} />
        </EditPopup>
      )}`
          : ''
      }
    </div>
  );
}
`;
};
//# sourceMappingURL=table-with-search.js.map
