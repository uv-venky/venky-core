import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { cn } from '../../../lib/utils';
import { ClearButton } from '../../../components/core/smart-search/ClearButton';
import { SearchButton } from '../../../components/core/smart-search/SearchButton';
import { SearchInput } from '../../../components/core/smart-search/SearchInput';
import { SearchModeToggle } from '../../../components/core/smart-search/SearchModeToggle';
import { SmartSearchColumnsProvider, SmartSearchProvider } from '../../../components/core/smart-search/context';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAppContext } from '../../../components/sidebar/app-provider';
import { deepEqual } from '../../../lib/core/common/deepUtils';
function SmartSearch(props) {
    const { onSearch, columns, filters, headerFilters, searchOnBlur = true, savedSearch, placeholder, readOnly, border, className, roundedCorners, hideSearchButton, isBusy, stickyFilters, enableNaturalLanguageSearch: enableNaturalLanguageSearchProp, nlPlaceholder, defaultSearchInputMode: defaultSearchInputModeProp, } = props;
    const { naturalLanguageSearchEnabled, DEFAULT_SEARCH_INPUT_MODE, DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH } = useAppContext();
    const enableNaturalLanguageSearchPropWithDefault = enableNaturalLanguageSearchProp ?? DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH;
    const defaultSearchInputMode = defaultSearchInputModeProp ?? DEFAULT_SEARCH_INPUT_MODE;
    const enableNaturalLanguageSearch = naturalLanguageSearchEnabled && enableNaturalLanguageSearchPropWithDefault;
    const [searchInputMode, setSearchInputMode] = useState(enableNaturalLanguageSearch ? defaultSearchInputMode : 'chips');
    const [focusInputToken, setFocusInputToken] = useState(0);
    const prevFiltersRef = useRef(filters);
    // Programmatic filter updates (metric cards, saved searches, etc.) should show chip UI.
    useEffect(() => {
        const prev = prevFiltersRef.current;
        prevFiltersRef.current = filters;
        if (!enableNaturalLanguageSearch || searchInputMode !== 'nl')
            return;
        if (deepEqual(prev, filters))
            return;
        if (filters.length > 0) {
            setSearchInputMode('chips');
        }
    }, [enableNaturalLanguageSearch, filters, searchInputMode]);
    const handleSearchInputModeChange = useCallback((mode) => {
        setSearchInputMode(mode);
    }, []);
    const handleSearchInputModeToggle = useCallback((mode) => {
        setSearchInputMode(mode);
        setFocusInputToken((token) => token + 1);
    }, []);
    const showModeToggle = enableNaturalLanguageSearch && !readOnly;
    return (_jsx(ErrorBoundary, { showDetails: process.env.NODE_ENV === 'development', children: _jsx(SmartSearchColumnsProvider, { columns: columns, children: _jsx(SmartSearchProvider, { filters: filters, headerFilters: headerFilters, searchOnBlur: searchOnBlur, onSearch: onSearch, stickyFilters: stickyFilters, children: _jsxs("div", { "data-smart-search": true, className: cn('smart-search flex min-h-[40px] w-full gap-2 p-1', className, {
                        border: border === 'full',
                        'border-b': border === 'bottom',
                        'rounded-md': roundedCorners && border === 'full',
                    }), children: [savedSearch != null ? _jsx("div", { className: cn(searchInputMode === 'nl' && 'hidden'), children: savedSearch }) : null, _jsx(SearchInput, { placeholder: placeholder, nlPlaceholder: nlPlaceholder, readOnly: readOnly, stickyFilters: stickyFilters, searchInputMode: showModeToggle ? searchInputMode : undefined, onSearchInputModeChange: handleSearchInputModeChange, focusInputToken: focusInputToken }), !readOnly && (_jsxs(_Fragment, { children: [showModeToggle && (_jsx(SearchModeToggle, { mode: searchInputMode, onModeChange: handleSearchInputModeToggle, disabled: isBusy })), _jsx(ClearButton, { stickyFilters: stickyFilters }), !hideSearchButton && _jsx(SearchButton, { isBusy: isBusy })] }))] }) }) }) }));
}
export default memo(SmartSearch);
//# sourceMappingURL=SmartSearch.js.map