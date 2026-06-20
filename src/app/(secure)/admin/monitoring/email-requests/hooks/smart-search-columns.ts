'use client';

import type { Column } from '@/components/core/smart-search/types';
import type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
import { useMemo } from 'react';

export default function useEmailRequestsSmartSearchColumns(): Column<EmailRequests>[] {
  return useMemo(
    () => [
      { key: 'requestId', label: 'ID', type: 'Number', defaultOperator: 'eq' },
      { key: 'toAddress', label: 'To', type: 'Text', defaultOperator: 'is' },
      { key: 'subject', label: 'Subject', type: 'Text', defaultOperator: 'is' },
      {
        key: 'createdAt',
        label: 'Created At',
        type: 'Date',
        defaultOperator: 'on',
      },
      { key: 'sentAt', label: 'Sent At', type: 'Date', defaultOperator: 'on' },
    ],
    [],
  );
}
