import type { Path } from '../../../components/core/mutX/ImmutableTypes';
type Props<T extends object> = {
    attributeCode: string;
    index: number;
    path: Path;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    stickyFilters?: (keyof T)[];
};
declare const _default: <T extends object>(props: Props<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=ColumnList.d.ts.map