import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { memo } from 'react';
import { useRowValue } from '../../../components/core/hooks/useStoreHooks';
import { useIsExpanded, useIsExpanding, useIsStartEnd } from '../../../components/core/hooks/useTreeStoreHooks';
import { useCurrentTreeStore } from '../../../components/core/page/RowIdProvider';
import Indent from '../../../components/core/table/Indent';
import { Cell } from '../../../components/core/table/table-cell';
import { assertExists } from '../../../components/core/utils/assert';
import { cn } from '../../../lib/utils';
import './tree-cell.css';
const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';
function TableTreeCell({ attributeCode, labelAttributeCode, className, row, onClick, endComponent, feedbackMask, }) {
    const store = useCurrentTreeStore();
    assertExists(store, 'Store not found in TableTreeCell');
    const value = useRowValue(store, row.id, attributeCode);
    let label = useRowValue(store, row.id, labelAttributeCode) ?? '';
    if (typeof label !== 'string') {
        label = String(label);
    }
    const hasChildren = useRowValue(store, row.id, 'hasChildren') ?? false;
    const level = useRowValue(store, row.id, 'level') ?? 0;
    const isExpanded = useIsExpanded(store, row.id);
    const isExpanding = useIsExpanding(store, row.id);
    const [isStart, isEnd] = useIsStartEnd(store, row.id);
    if (value == null) {
        return (_jsx(Cell, { className: className, attributeCode: attributeCode, store: store, rowId: row.id, feedbackMask: feedbackMask }));
    }
    function renderSwitcher() {
        if (!hasChildren) {
            return _jsx("span", { className: "tree-leaf" });
        }
        return (_jsx("span", { role: "button", tabIndex: 0, onClick: (e) => {
                if (!store)
                    return;
                e.stopPropagation();
                if (isExpanded) {
                    store.collapseRow(row.id);
                }
                else {
                    store.expandRow(row.id);
                }
            }, className: cn('tree-expander cursor-pointer', `tree-expander-${isExpanded ? ICON_OPEN : ICON_CLOSE}`), children: _jsx("span", { className: "tree-expander-icon z-10 bg-background text-muted-foreground group-hover/row:bg-background group-data-[state=selected]/row:bg-background", children: isExpanding ? (_jsx(Loader2, { className: "animate-spin" })) : isExpanded ? (_jsx(MinusCircle, { className: "" })) : (_jsx(PlusCircle, { className: "" })) }) }));
    }
    return (_jsxs(Cell, { onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, className: cn('tree-cell select-none overflow-visible bg-background group-hover/row:bg-background group-data-[state=selected]/row:bg-background', {
            [`tree-node-${isExpanded ? 'open' : 'close'}`]: hasChildren,
            'tree-leaf-last': isEnd[level],
        }, className), dataTip: label, attributeCode: attributeCode, store: store, rowId: row.id, feedbackMask: feedbackMask, children: [_jsx(Indent, { level: level, isStart: isStart, isEnd: isEnd }), renderSwitcher(), _jsx("span", { role: "button", tabIndex: 0, onClick: onClick, className: "ml-2 flex h-full items-center truncate", children: label }), endComponent] }));
}
export default memo(TableTreeCell);
//# sourceMappingURL=table-tree-cell.js.map