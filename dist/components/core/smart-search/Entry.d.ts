import type { FilterEntry } from '../../../lib/core/common/ds/types/filter';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
interface Props<T extends object> {
    filter: FilterEntry<T>;
    index: number;
    path: Path;
    readOnly?: boolean;
    stickyFilters?: (keyof T)[];
    active?: boolean;
}
declare const _default: <T extends object>(props: Props<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=Entry.d.ts.map