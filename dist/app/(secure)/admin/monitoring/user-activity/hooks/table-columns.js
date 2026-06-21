/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import HeaderCell from '../../../../../../components/core/table/header-cell';
import TableCell, { Cell } from '../../../../../../components/core/table/table-cell';
import { useMemo, useState } from 'react';
import { assertExists } from '../../../../../../components/core/utils/assert';
import { useCurrentStore } from '../../../../../../components/core/page/RowIdProvider';
import { useRowValue } from '../../../../../../components/core/hooks/useStoreHooks';
import { Button } from '../../../../../../components/ui/button';
import { isEmpty, isEmptyObject } from '../../../../../../lib/core/common/isEmpty';
import { splitFilter } from '../../../../../../lib/core/common/ds/types/filter';
import { InfoIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../../../components/ui/dialog';
import useTheme from '../../../../../../components/core/hooks/useTheme';
import JsonPreview from '../../../../../../components/core/common/json-preview';
function MetadataInfo({ rowId }) {
    const store = useCurrentStore();
    assertExists(store, 'Missing store in MetadataInfo');
    const value = useRowValue(store, rowId, 'metadata');
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    if (isEmptyObject(value)) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "icon", className: "mr-2 shrink-0 p-0", onClick: (e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }, activityId: "no-log", children: _jsx(InfoIcon, { className: "size-4" }) }), _jsx(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: _jsxs(DialogContent, { className: "w-[800px] sm:max-w-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Metadata" }) }), _jsx(JsonPreview, { value: value, theme: theme === 'dark' ? 'dark' : 'light' })] }) })] }));
}
function ActivityCell(props) {
    const { row, attributeCode } = props;
    const store = useCurrentStore();
    assertExists(store, 'Missing store in ActivityCell');
    const value = useRowValue(store, row.id, attributeCode);
    return (_jsxs(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: "justify-start", children: [attributeCode === 'eventId' && _jsx(MetadataInfo, { rowId: row.id }), _jsx(Button, { variant: "link", size: "sm", disabled: isEmpty(value), className: "truncate p-0", onClick: () => {
                    if (isEmpty(value)) {
                        return;
                    }
                    store.setSmartSearchFilters([
                        ...store.smartSearchFilters().filter((f) => splitFilter(f).attributeCode !== attributeCode),
                        {
                            [attributeCode]: { is: value },
                        },
                    ]);
                    store.executeQuery({});
                }, children: value })] }));
}
export default function useUserActivityTableColumns(store) {
    return useMemo(() => {
        const columns = [
            {
                accessorKey: 'activityId',
                meta: {
                    label: 'Activity Id',
                },
                size: 90,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Number", store: store, accessorKey: "activityId", title: "Activity Id" });
                },
                cell: (props) => _jsx(TableCell, { type: "Number", attributeCode: "activityId", ...props }),
            },
            {
                accessorKey: 'createdAt',
                meta: {
                    label: 'Date',
                },
                size: 110,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Date", store: store, accessorKey: "createdAt", title: "Date" });
                },
                cell: (props) => _jsx(TableCell, { type: "Date", dateFormat: "M/d H:mm:ss", attributeCode: "createdAt", ...props }),
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
                cell: (props) => _jsx(ActivityCell, { attributeCode: "userName", ...props }),
            },
            {
                accessorKey: 'trackId',
                meta: {
                    label: 'Track Id',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "trackId", title: "Track Id" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "trackId", ...props }),
            },
            {
                accessorKey: 'eventType',
                meta: {
                    label: 'Event Type',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "eventType", title: "Event Type" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "eventType", ...props }),
            },
            {
                accessorKey: 'eventId',
                meta: {
                    label: 'Event Id',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "eventId", title: "Event Id" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "eventId", ...props }),
            },
            {
                accessorKey: 'pageUrl',
                meta: {
                    label: 'Page Url',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "pageUrl", title: "Page Url" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "pageUrl", ...props }),
            },
            {
                accessorKey: 'dataSource',
                meta: {
                    label: 'Data Source',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "dataSource", title: "Data Source" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "dataSource", ...props }),
            },
            {
                accessorKey: 'apiName',
                meta: {
                    label: 'Api Name',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "apiName", title: "Api Name" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "apiName", ...props }),
            },
            {
                accessorKey: 'elapsedTimeMs',
                meta: {
                    label: 'Elapsed Time Ms',
                },
                size: 90,
                header: (props) => {
                    return (_jsx(HeaderCell, { ...props, type: "Number", store: store, accessorKey: "elapsedTimeMs", title: "Elapsed Time Ms" }));
                },
                cell: (props) => _jsx(TableCell, { type: "Number", attributeCode: "elapsedTimeMs", ...props }),
            },
            /* Ignored column metadata of type jsonb! */
            {
                accessorKey: 'rowCount',
                meta: {
                    label: 'Row Count',
                },
                size: 90,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Number", store: store, accessorKey: "rowCount", title: "Row Count" });
                },
                cell: (props) => _jsx(TableCell, { type: "Number", attributeCode: "rowCount", ...props }),
            },
            {
                accessorKey: 'sessionId',
                meta: {
                    label: 'Session Id',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "sessionId", title: "Session Id" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "sessionId", ...props }),
            },
            {
                accessorKey: 'appVersion',
                meta: {
                    label: 'App Version',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "appVersion", title: "App Version" });
                },
                cell: (props) => _jsx(ActivityCell, { attributeCode: "appVersion", ...props }),
            },
        ];
        return columns;
    }, [store]);
}
//# sourceMappingURL=table-columns.js.map