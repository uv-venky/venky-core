/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useMemo } from 'react';
export default function useUserActivityHistorySmartSearchColumns() {
    return useMemo(() => {
        const columns = [
            {
                key: 'activityDate',
                label: 'Date',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'userName',
                label: 'User Name',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'pageUrl',
                label: 'Page Url',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'activityCount',
                label: 'Count',
                type: 'Number',
                defaultOperator: 'eq',
            },
        ];
        return columns;
    }, []);
}
//# sourceMappingURL=smart-search-columns.js.map