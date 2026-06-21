import { type FilterEntry } from '../../../lib/core/common/ds/types/filter';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import type { ActiveSection } from '../../../components/core/smart-search/SmartSearchTypes';
type Props<T> = {
    filter: FilterEntry<T>;
    index: number;
    path: Path;
    activeSection?: ActiveSection;
    stickyFilters?: (keyof T)[];
};
declare const _default: <T extends object>(props: Props<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=EntryEditor.d.ts.map