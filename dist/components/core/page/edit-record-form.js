'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsStoreLoading } from '../../../components/core/hooks/useStoreHooks';
import { memo } from 'react';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Skeleton } from '../../../components/ui/skeleton';
function EditRecordFormComponent({ title, store, children, numberOfFields = 20, }) {
    const isStoreLoading = useIsStoreLoading(store);
    return (_jsxs(ScrollArea, { className: "h-full", children: [_jsxs("div", { className: "shrink-0 p-6", children: [_jsx("div", { className: "font-semibold text-xl", children: title }), _jsx("div", { className: "font-light text-sm", children: `Select Rows to configure, Fill in the form and click save changes after all the changes were done.` })] }), isStoreLoading ? (_jsx("div", { className: "items-center gap-2 px-6", children: [...Array(numberOfFields)].map((_, i) => (_jsxs("div", { className: "grid grid-cols-3 p-2", children: [_jsx(Skeleton, { className: "col-span-1 mr-2 h-9" }), _jsx(Skeleton, { className: "col-span-2 mr-2 h-9" })] }, i))) })) : (_jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-auto px-6", children: children }))] }));
}
export const EditRecordForm = memo(EditRecordFormComponent);
//# sourceMappingURL=edit-record-form.js.map