/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column } from '@/components/core/smart-search/types';
import type { UserActivity } from '@/lib/common/ds/types/core/UserActivity';
import { useMemo } from 'react';

export default function useSmartSearchColumns(): Column<UserActivity>[] {
  return useMemo(() => {
    const columns: Column<UserActivity>[] = [
      {
        key: 'activityId',
        label: 'Activity Id',
        type: 'Number',
        defaultOperator: 'eq',
      },
      {
        key: 'createdAt',
        label: 'Created At',
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
        key: 'eventId',
        label: 'Event Id',
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
        key: 'dataSource',
        label: 'Data Source',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'apiName',
        label: 'Api Name',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'elapsedTimeMs',
        label: 'Elapsed Time Ms',
        type: 'Number',
        defaultOperator: 'eq',
      },
      /* Ignored column metadata of type jsonb! */
      {
        key: 'rowCount',
        label: 'Row Count',
        type: 'Number',
        defaultOperator: 'eq',
      },
      {
        key: 'trackId',
        label: 'Track Id',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'sessionId',
        label: 'Session Id',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'appVersion',
        label: 'App Version',
        type: 'Text',
        defaultOperator: 'is',
      },
    ];
    return columns;
  }, []);
}
