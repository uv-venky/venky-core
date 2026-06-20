/* Copyright (c) 2024-present Venky Corp. */

'use client';

import PageLayoutTemplate from '@/components/core/page/page-layout-template';
import { ScrollText } from 'lucide-react';
import useLogsSmartSearchColumns from './hooks/smart-search-columns';
import useLogsTableColumns from './hooks/table-columns';
import { useLogsStore } from './hooks/use-store';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { Logs } from '@/lib/common/ds/types/core/Logs';

const defaultVisibleColumnOrder: StringKeyof<Logs>[] = [
  'createdAt',
  'level',
  'trackId',
  'message',
  'apiName',
  'dataSource',
];

export default function LogsPageContent() {
  const store = useLogsStore();
  const smartSearchColumns = useLogsSmartSearchColumns();
  const tableColumns = useLogsTableColumns(store);

  return (
    <PageLayoutTemplate
      searchOnBlur={true}
      loadingRows={0}
      title="DB Logs"
      subTitle="Manage DB Logs"
      icon={<ScrollText className="h-12 w-12 text-muted-foreground" />}
      store={store}
      smartSearchColumns={smartSearchColumns}
      tableColumns={tableColumns}
      pageId="logs-page"
      itemId="logs"
      addNewButtonText="Add New Logs"
      defaultVisibleColumnOrder={defaultVisibleColumnOrder}
    />
  );
}
