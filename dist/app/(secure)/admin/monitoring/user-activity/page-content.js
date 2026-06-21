/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import PageLayoutTemplate from '../../../../../components/core/page/page-layout-template';
import { Activity } from 'lucide-react';
import useUserActivitySmartSearchColumns from './hooks/smart-search-columns';
import useUserActivityTableColumns from './hooks/table-columns';
import { useUserActivityStore } from './hooks/use-store';
const defaultVisibleColumnOrder = [
    'createdAt',
    'userName',
    'trackId',
    'eventType',
    'eventId',
    'dataSource',
    'pageUrl',
];
export default function UserActivityPageContent() {
    const store = useUserActivityStore();
    const smartSearchColumns = useUserActivitySmartSearchColumns();
    const tableColumns = useUserActivityTableColumns(store);
    return (_jsx(PageLayoutTemplate, { title: "User Activity", subTitle: "Manage User Activity", icon: _jsx(Activity, { className: "h-12 w-12 text-muted-foreground" }), store: store, smartSearchColumns: smartSearchColumns, tableColumns: tableColumns, pageId: "user-activity-page", itemId: "user-activity", addNewButtonText: "Add New User Activity", defaultVisibleColumnOrder: defaultVisibleColumnOrder, searchOnBlur: true, showExportButton: true, exportFilename: "user-activity", exportIncludeMetadata: true }));
}
//# sourceMappingURL=page-content.js.map