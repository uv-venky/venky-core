/* Copyright (c) 2024-present Venky Corp. */

'use client';

import PageLayoutTemplate from '@/components/core/page/page-layout-template';
import { Clock } from 'lucide-react';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { UserActivityArchive } from '@/lib/common/ds/types/core/UserActivityArchive';
import useUserActivityHistorySmartSearchColumns from './hooks/smart-search-columns';
import useUserActivityHistoryTableColumns from './hooks/table-columns';
import { useUserActivityHistoryStore } from './hooks/use-store';

const defaultVisibleColumnOrder: StringKeyof<UserActivityArchive>[] = [
  'activityDate',
  'userName',
  'eventType',
  'pageUrl',
  'activityCount',
  'spacer',
];

export default function UserActivityHistoryPageContent() {
  const store = useUserActivityHistoryStore();
  const smartSearchColumns = useUserActivityHistorySmartSearchColumns();
  const tableColumns = useUserActivityHistoryTableColumns(store);

  return (
    <PageLayoutTemplate
      title="User Activity History"
      subTitle="Summarized daily page views by user"
      icon={<Clock className="h-12 w-12 text-muted-foreground" />}
      store={store}
      smartSearchColumns={smartSearchColumns}
      tableColumns={tableColumns}
      pageId="user-activity-history-page"
      itemId="user-activity-history"
      defaultVisibleColumnOrder={defaultVisibleColumnOrder}
      searchOnBlur
      showExportButton
      exportFilename="user-activity-history"
    />
  );
}
