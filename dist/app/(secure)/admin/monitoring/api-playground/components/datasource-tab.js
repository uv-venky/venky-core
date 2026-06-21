'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useClientSession } from '../../../../../../components/core/session-context';
import { LazyMonacoEditor } from '../MonacoEditorLazy';
import { useMemo } from 'react';
export const WHO_ATTRIBUTES = [
    'createdBy',
    'createdAt',
    'updatedBy',
    'updatedAt',
    'lastUpdateDate',
    'creationDate',
    'lastUpdatedBy',
];
export function getWhoAttributesCount(ds) {
    return ds?.attributes.filter((attr) => WHO_ATTRIBUTES.includes(attr.code)).length ?? 0;
}
export function isMissingPrimaryKey(ds) {
    return ds?.attributes.filter((attr) => attr.primary).length === 0;
}
export function DataSourceTab({ selectedDS, filter }) {
    const session = useClientSession();
    const ds = useMemo(() => {
        if (!selectedDS)
            return null;
        if (!filter)
            return selectedDS;
        return {
            ...selectedDS,
            access: filter ? undefined : selectedDS.access,
            attributes: selectedDS.attributes.filter((attr) => (filter === 'primary' && attr.primary) ||
                (filter === 'who' && WHO_ATTRIBUTES.includes(attr.code)) ||
                (filter === 'required' && !attr.optional)),
        };
    }, [selectedDS, filter]);
    const payload = filter ? ds?.attributes : { dataSource: ds, userRoles: session.roles };
    return (_jsx("div", { className: "flex h-full flex-col", children: _jsx(LazyMonacoEditor, { value: selectedDS ? JSON.stringify(payload, null, 2) : 'Select a data source to view its definition', type: "Result", disabled: true }) }));
}
//# sourceMappingURL=datasource-tab.js.map