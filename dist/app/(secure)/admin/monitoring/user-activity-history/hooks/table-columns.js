/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import HeaderCell from '../../../../../../components/core/table/header-cell';
import TableCell from '../../../../../../components/core/table/table-cell';
import { useMemo } from 'react';
export default function useUserActivityHistoryTableColumns(store) {
    return useMemo(() => {
        const columns = [
            {
                accessorKey: 'activityDate',
                meta: {
                    label: 'Date',
                },
                size: 110,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Date", store: store, accessorKey: "activityDate", title: "Date" });
                },
                cell: (props) => _jsx(TableCell, { type: "Date", dateFormat: "M/d/yyyy", attributeCode: "activityDate", ...props }),
            },
            {
                accessorKey: 'userName',
                meta: {
                    label: 'User Name',
                },
                size: 160,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "userName", title: "User Name" });
                },
                cell: (props) => _jsx(TableCell, { type: "Text", attributeCode: "userName", ...props }),
            },
            {
                accessorKey: 'eventType',
                meta: {
                    label: 'Event Type',
                },
                size: 160,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "eventType", title: "Event Type" });
                },
                cell: (props) => _jsx(TableCell, { type: "Text", attributeCode: "eventType", ...props }),
            },
            {
                accessorKey: 'pageUrl',
                meta: {
                    label: 'Page Url',
                },
                size: 400,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "pageUrl", title: "Page Url" });
                },
                cell: (props) => _jsx(TableCell, { type: "Text", attributeCode: "pageUrl", ...props }),
            },
            {
                accessorKey: 'activityCount',
                meta: {
                    label: 'Count',
                },
                size: 90,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Number", store: store, accessorKey: "activityCount", title: "Count" });
                },
                cell: (props) => _jsx(TableCell, { type: "Number", attributeCode: "activityCount", ...props }),
            },
            {
                accessorKey: 'spacer',
                meta: {
                    label: '-',
                },
                size: 5,
                enableHiding: false,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "spacer", title: "" });
                },
                cell: (props) => _jsx(TableCell, { type: "Text", attributeCode: "spacer", ...props }),
            },
        ];
        return columns;
    }, [store]);
}
//# sourceMappingURL=table-columns.js.map