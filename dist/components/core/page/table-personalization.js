import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Personalization, useTableColumnsPersonalizationTab, useTableDensityPersonalizationTab, useTableStickyPersonalizationTab, } from '../../../components/core/page/personalization';
export function TablePersonalization({ table, variant, className, pageId, itemId, store, }) {
    const columnsTab = useTableColumnsPersonalizationTab(table);
    const densityTab = useTableDensityPersonalizationTab(table);
    const stickyTab = useTableStickyPersonalizationTab(table);
    const tabs = useMemo(() => {
        return [columnsTab, densityTab, stickyTab];
    }, [columnsTab, densityTab, stickyTab]);
    return (_jsx(Personalization, { className: className, tabs: tabs, pageId: pageId, itemId: itemId, variant: variant, store: store }));
}
//# sourceMappingURL=table-personalization.js.map