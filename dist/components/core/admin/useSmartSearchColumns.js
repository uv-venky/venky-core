'use client';
import { useMemo } from 'react';
export default function useSmartSearchColumns() {
    return useMemo(() => {
        const columns = [
            {
                key: 'userId',
                label: 'User ID',
                type: 'Number',
                defaultOperator: 'eq',
            },
            {
                key: 'expiresAt',
                label: 'Expires At',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'signedInAt',
                label: 'Signed In At',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'lastAccessedAt',
                label: 'Last Accessed At',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'signedOutAt',
                label: 'Signed Out At',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'sessionId',
                label: 'Session Id',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'ipAddress',
                label: 'IP Address',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'userAgent',
                label: 'User Agent',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'userName',
                label: 'User Name',
                type: 'Text',
                defaultOperator: 'is',
            },
        ];
        return columns;
    }, []);
}
//# sourceMappingURL=useSmartSearchColumns.js.map