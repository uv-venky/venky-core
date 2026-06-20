/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column } from '@/components/core/smart-search/types';
import type { UserActivityArchive } from '@/lib/common/ds/types/core/UserActivityArchive';
import { useMemo } from 'react';

export default function useUserActivityHistorySmartSearchColumns(): Column<UserActivityArchive>[] {
  return useMemo(() => {
    const columns: Column<UserActivityArchive>[] = [
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
