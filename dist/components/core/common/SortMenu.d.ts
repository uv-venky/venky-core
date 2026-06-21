import type { SortDirection } from '../../../components/core/pivot/PivotTypes';
import type { Store } from '../../../lib/core/common/types/Store';
declare function SortMenu(props: {
    onSort: (direction?: SortDirection) => Promise<void>;
    sortDirection?: SortDirection;
    sortPosition?: number;
    className?: string;
    iconClassName?: string;
    sortIcon?: React.ReactNode;
    store?: Store<any>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disableHeaderFilters?: boolean;
    columnId?: string;
}): import("react/jsx-runtime").JSX.Element;
declare const _default: import("react").MemoExoticComponent<typeof SortMenu>;
export default _default;
//# sourceMappingURL=SortMenu.d.ts.map