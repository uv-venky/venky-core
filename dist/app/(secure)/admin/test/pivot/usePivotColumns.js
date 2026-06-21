'use client';
import { useMemo } from 'react';
import { useClientSession } from '../../../../../components/core/session-context';
export default function usePivotColumns() {
    const session = useClientSession();
    const roles = session?.roles;
    return useMemo(() => {
        if (!roles) {
            return [];
        }
        // customize pivot columns based on roles etc.
        const columns = [
            {
                key: 'apiKey',
                label: 'Api Key',
                dataType: 'Text',
            },
            {
                key: 'apiSecret',
                label: 'Api Secret',
                dataType: 'Text',
            },
            {
                key: 'createdAt',
                label: 'Created At',
                dataType: 'Date',
            },
            {
                key: 'createdBy',
                label: 'Created By',
                dataType: 'Text',
            },
            {
                key: 'displayName',
                label: 'Display Name',
                dataType: 'Text',
            },
            {
                key: 'email',
                label: 'Email',
                dataType: 'Text',
            },
            {
                key: 'endDate',
                label: 'End Date',
                dataType: 'Date',
            },
            {
                key: 'failedLoginAttempts',
                label: 'Failed Login Attempts',
                dataType: 'Number',
                canBeRow: false,
                canBeColumn: false,
            },
            {
                key: 'ipAddress',
                label: 'Ip Address',
                dataType: 'Text',
            },
            {
                key: 'lastFailedLogin',
                label: 'Last Failed Login',
                dataType: 'Date',
            },
            {
                key: 'lastFailedLoginIpAddress',
                label: 'Last Failed Login Ip Address',
                dataType: 'Text',
            },
            {
                key: 'lastLogin',
                label: 'Last Login',
                dataType: 'Date',
            },
            {
                key: 'lastPasswordReset',
                label: 'Last Password Reset',
                dataType: 'Date',
            },
            {
                key: 'lastPasswordResetBy',
                label: 'Last Password Reset By',
                dataType: 'Text',
            },
            {
                key: 'lastPasswordResetIpAddress',
                label: 'Last Password Reset Ip Address',
                dataType: 'Text',
            },
            {
                key: 'locationName',
                label: 'Location Name',
                dataType: 'Text',
            },
            {
                key: 'locked',
                label: 'Locked',
                dataType: 'Boolean',
            },
            {
                key: 'passwordHash',
                label: 'Password Hash',
                dataType: 'Text',
            },
            {
                key: 'picture',
                label: 'Picture',
                dataType: 'Text',
            },
            /* Ignored column previous_password_hashes of type jsonb! */
            /* Ignored column settings of type jsonb! */
            {
                key: 'startDate',
                label: 'Start Date',
                dataType: 'Date',
            },
            {
                key: 'updatedAt',
                label: 'Updated At',
                dataType: 'Date',
            },
            {
                key: 'updatedBy',
                label: 'Updated By',
                dataType: 'Text',
            },
            {
                key: 'userId',
                label: 'User Id',
                dataType: 'Number',
                canBeRow: false,
                canBeColumn: false,
            },
            {
                key: 'userName',
                label: 'User Name',
                dataType: 'Text',
            },
        ];
        return columns;
    }, [roles]);
}
//# sourceMappingURL=usePivotColumns.js.map