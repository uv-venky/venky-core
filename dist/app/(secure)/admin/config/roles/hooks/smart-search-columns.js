/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useMemo } from 'react';
export default function useSmartSearchColumns() {
    return useMemo(() => {
        // customize columns based on roles etc.
        const columns = [
            {
                key: 'roleCode',
                label: 'Role Code',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'roleName',
                label: 'Role Name',
                type: 'Text',
                defaultOperator: 'is',
            },
            {
                key: 'startDate',
                label: 'Start Date',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'endDate',
                label: 'End Date',
                type: 'Date',
                defaultOperator: 'on',
            },
            {
                key: 'description',
                label: 'Description',
                type: 'Text',
                defaultOperator: 'is',
            },
        ];
        return columns;
    }, []);
}
//# sourceMappingURL=smart-search-columns.js.map