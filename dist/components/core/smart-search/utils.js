import { splitFilter } from '../../../lib/core/common/ds/types/filter';
export function isStickyFilter(f, stickyFilters) {
    return !!stickyFilters?.includes(splitFilter(f).attributeCode);
}
//# sourceMappingURL=utils.js.map