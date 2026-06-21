import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsStoreLoading, useHasMoreRows } from '../../../components/core/hooks/useStoreHooks';
import { Button } from '../../../components/ui/button';
import { ChevronDownIcon, Loader2 } from 'lucide-react';
export default function LoadMore({ store, variant = 'default', }) {
    const hasMoreRows = useHasMoreRows(store);
    const isLoading = useIsStoreLoading(store);
    if (!hasMoreRows) {
        return null;
    }
    return (_jsxs(Button, { variant: variant, className: "flex items-center justify-center gap-4", onClick: () => store.next(), disabled: isLoading, children: [isLoading ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(ChevronDownIcon, { className: "h-4 w-4" }), "Load more..."] }));
}
//# sourceMappingURL=LoadMore.js.map