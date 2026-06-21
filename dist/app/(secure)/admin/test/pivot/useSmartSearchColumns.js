'use client';
import { useMemo } from 'react';
import { useClientSession } from '../../../../../components/core/session-context';
export default function useSmartSearchColumns() {
    const session = useClientSession();
    const roles = session?.roles;
    return useMemo(() => {
        if (!roles) {
            return [];
        }
        // customize columns based on roles etc.
        const columns = [
            {
                key: 'apiKey',
                label: 'Api Key',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'apiSecret',
                label: 'Api Secret',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'createdAt',
                label: 'Created At',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'createdBy',
                label: 'Created By',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'displayName',
                label: 'Display Name',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'email',
                label: 'Email',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'endDate',
                label: 'End Date',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'failedLoginAttempts',
                label: 'Failed Login Attempts',
                type: 'Number',
                defaultOperator: 'eq',
            },
            {
                key: 'ipAddress',
                label: 'Ip Address',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'lastFailedLogin',
                label: 'Last Failed Login',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'lastFailedLoginIpAddress',
                label: 'Last Failed Login Ip Address',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'lastLogin',
                label: 'Last Login',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'lastPasswordReset',
                label: 'Last Password Reset',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'lastPasswordResetBy',
                label: 'Last Password Reset By',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'lastPasswordResetIpAddress',
                label: 'Last Password Reset Ip Address',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'locationName',
                label: 'Location Name',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'locked',
                label: 'Locked',
                type: 'Boolean',
                defaultOperator: 'istrue',
            },
            {
                key: 'passwordHash',
                label: 'Password Hash',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'picture',
                label: 'Picture',
                type: 'Text',
                defaultOperator: 'is',
            },
            /* Ignored column previous_password_hashes of type jsonb! */
            /* Ignored column settings of type jsonb! */
            {
                key: 'startDate',
                label: 'Start Date',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'updatedAt',
                label: 'Updated At',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'updatedBy',
                label: 'Updated By',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'userId',
                label: 'User Id',
                type: 'Number',
                defaultOperator: 'eq',
            },
            {
                key: 'userName',
                label: 'User Name',
                type: 'Text',
                defaultOperator: 'is',
            },
        ];
        return columns;
    }, [roles]);
}
//# sourceMappingURL=useSmartSearchColumns.js.map