import { kebabCase } from 'lodash-es';
export default ({ dsName }) => {
    const alias = kebabCase(dsName);
    return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } ${'from'} '@/components/ui/button';
import { SimplePageTemplate } ${'from'} '@/components/core/page';
import use${dsName}SmartSearchColumns ${'from'} './hooks/smart-search-columns';
import use${dsName}TableColumns ${'from'} './hooks/table-columns';
import { use${dsName}Store } ${'from'} './hooks/use-store';

export default function ${dsName}PageContent() {
  const store = use${dsName}Store();
  const smartSearchColumns = use${dsName}SmartSearchColumns();
  const tableColumns = use${dsName}TableColumns(store);

  return (
    <SimplePageTemplate
      store={store}
      smartSearchColumns={smartSearchColumns}
      tableColumns={tableColumns}
      pageId="${alias}-page"
      itemId="${alias}"
      headerEndContent={
        <Button className="h-[46px]" variant="secondary">
          Change Me!
        </Button>
      }
    />
  );
}
`;
};
//# sourceMappingURL=page-content.js.map