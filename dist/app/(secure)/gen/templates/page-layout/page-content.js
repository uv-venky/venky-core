import { camelCase, kebabCase, startCase } from 'lodash-es';
export default ({ dsName, editable }) => {
  const dsTitle = startCase(camelCase(dsName));
  const alias = kebabCase(dsName);
  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { PageLayoutTemplate } ${'from'} '@/components/core/page';
import { ShoppingCart } ${'from'} 'lucide-react';${editable ? `\nimport EditForm ${'from'} './components/edit-form';` : ''}
import use${dsName}SmartSearchColumns ${'from'} './hooks/smart-search-columns';
import use${dsName}TableColumns ${'from'} './hooks/table-columns';
import { use${dsName}Store } ${'from'} './hooks/use-store';

export default function ${dsName}PageContent() {
  const store = use${dsName}Store();
  const smartSearchColumns = use${dsName}SmartSearchColumns();
  const tableColumns = use${dsName}TableColumns(store);

  return (
      <PageLayoutTemplate
        title="${dsTitle}"
        subTitle="Manage ${dsTitle}"
        icon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
        store={store}
        smartSearchColumns={smartSearchColumns}
        tableColumns={tableColumns}
        pageId="${alias}-page"
        itemId="${alias}"${
          editable
            ? `\n        editForm={<EditForm store={store} />}
        getDefaultRow={() => {
          return {};
        }}`
            : ''
        }

        addNewButtonText="Add New ${dsTitle}"
      />
    );
  }
`;
};
//# sourceMappingURL=page-content.js.map
