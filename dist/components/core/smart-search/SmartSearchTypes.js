/* Copyright (c) 2024-present VENKY Corp. */
import { EMPTY_ARRAY, emptyFunction } from '../../../lib/core/common/isEmpty';
export function INITIAL_STATE() {
    return {
        filters: EMPTY_ARRAY,
        activePath: EMPTY_ARRAY,
        showFilters: true,
        activeView: undefined,
        searchOnBlur: false,
        onSearch: { current: emptyFunction },
        stickyFilters: EMPTY_ARRAY,
        editing: false,
        pendingSearch: undefined,
    };
}
export const COMBINER_OPTIONS = [
    { label: 'Any of', value: 'anyof', hint: 'OR' },
    { label: 'All of', value: 'allof', hint: 'AND' },
    { label: 'None of', value: 'noneof', hint: 'NOT' },
];
//# sourceMappingURL=SmartSearchTypes.js.map