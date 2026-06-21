/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import PageLayoutTemplate from '../../../../../components/core/page/page-layout-template';
import { Clock } from 'lucide-react';
import useUserActivityHistorySmartSearchColumns from './hooks/smart-search-columns';
import useUserActivityHistoryTableColumns from './hooks/table-columns';
import { useUserActivityHistoryStore } from './hooks/use-store';
const defaultVisibleColumnOrder = ['activityDate', 'userName', 'eventType', 'pageUrl', 'activityCount', 'spacer'];
export default function UserActivityHistoryPageContent() {
  const store = useUserActivityHistoryStore();
  const smartSearchColumns = useUserActivityHistorySmartSearchColumns();
  const tableColumns = useUserActivityHistoryTableColumns(store);
  return _jsx(PageLayoutTemplate, {
    title: 'User Activity History',
    subTitle: 'Summarized daily page views by user',
    icon: _jsx(Clock, { className: 'h-12 w-12 text-muted-foreground' }),
    store: store,
    smartSearchColumns: smartSearchColumns,
    tableColumns: tableColumns,
    pageId: 'user-activity-history-page',
    itemId: 'user-activity-history',
    defaultVisibleColumnOrder: defaultVisibleColumnOrder,
    searchOnBlur: true,
    showExportButton: true,
    exportFilename: 'user-activity-history',
  });
}
//# sourceMappingURL=page-content.js.map
