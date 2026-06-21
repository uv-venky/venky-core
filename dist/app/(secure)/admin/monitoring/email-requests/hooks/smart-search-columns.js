'use client';
import { useMemo } from 'react';
export default function useEmailRequestsSmartSearchColumns() {
    return useMemo(() => [
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
    ], []);
}
//# sourceMappingURL=smart-search-columns.js.map