import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { Plus, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DropdownMenuField } from '../../../components/core/dropdown-menu';
import useHandleClickOutside from '../../../components/core/hooks/useHandleClickOutside';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import { isSamePath } from '../../../components/core/mutX/ImmutableTypes';
import { getIn } from '../../../components/core/mutX/ImmutableUtils';
import Entry from '../../../components/core/smart-search/Entry';
import EntryEditor from '../../../components/core/smart-search/EntryEditor';
import { COMBINER_OPTIONS } from '../../../components/core/smart-search/SmartSearchTypes';
import { isComplete, useSmartSearchDispatcher, useSmartSearchState } from '../../../components/core/smart-search/context';
import { isStickyFilter } from '../../../components/core/smart-search/utils';
const LABEL = { anyof: 'Any of', allof: 'All of', noneof: 'None of' };
function NestedEntry(props) {
    const dispatch = useSmartSearchDispatcher();
    const state = useSmartSearchState();
    const [open, setOpen] = useState(false);
    useWhyDidYouUpdate('NestedEntry', props);
    const outerRef = useRef(null);
    function isEditingIncomplete() {
        if (!state.activePath.length)
            return false;
        return !isComplete(getIn(state.filters, state.activePath, undefined));
    }
    const showButtons = useCallback(() => {
        if (props.readOnly || !state.editing)
            return false;
        if (isSamePath(state.activePath, props.path))
            return true;
        const parent = [...state.activePath];
        parent.pop();
        return isSamePath(parent, props.path);
    }, [props.readOnly, state.activePath, props.path, state.editing]);
    useHandleClickOutside({
        ref: outerRef,
        onInteractOutside: () => {
            if (isEditingIncomplete()) {
                return;
            }
            dispatch({ type: 'editPath', path: [] });
        },
        shouldExcludeElement: (e) => {
            return e.dataset.smartSearch != null;
        },
        open: isSamePath(state.activePath, props.path),
    });
    useEffect(() => {
        if (showButtons() && state.activeSection === 'combiner') {
            setOpen(true);
        }
    }, [showButtons, state.activeSection]);
    return (_jsxs("div", { role: "button", tabIndex: -1, className: cn('nested flex items-center gap-2 rounded-md border px-1 py-0.5', isSamePath(state.activePath, props.path) ? 'ring-2 ring-ring' : ''), onClick: (e) => {
            e.stopPropagation();
        }, ref: outerRef, onKeyDown: (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                e.preventDefault();
                if (!open) {
                    dispatch({ type: 'escape' });
                }
            }
        }, children: [showButtons() ? (_jsx(DropdownMenuField, { open: open, onOpenChange: setOpen, dataTestId: "nested-entry-dropdown-menu", options: COMBINER_OPTIONS, value: props.path[props.path.length - 1], getLabel: (o) => o.label, getValue: (o) => o.value, onChange: (value) => {
                    dispatch({
                        type: 'setCombiner',
                        path: props.path,
                        combiner: value,
                    });
                } })) : (_jsx("span", { role: "button", tabIndex: -1, "data-testid": `nested-entry-${props.path.join('-')}`, className: cn({
                    'cursor-not-allowed': isEditingIncomplete(),
                    'cursor-pointer': !isEditingIncomplete() && !props.readOnly,
                }), onClick: (e) => {
                    e.stopPropagation();
                    if (props.readOnly || isEditingIncomplete())
                        return;
                    dispatch({
                        type: 'editPath',
                        path: props.path,
                        activeSection: 'combiner',
                    });
                }, children: LABEL[props.path[props.path.length - 1]] })), getIn(state.filters, props.path, []).map((filter, index) => {
                return isSamePath([...props.path, index], state.activePath) &&
                    !props.readOnly &&
                    state.editing &&
                    !isStickyFilter(filter, props.stickyFilters) ? (_jsx(EntryEditor
                // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
                , { path: props.path, index: index, filter: filter, activeSection: state.activeSection }, index)) : (_jsx(Entry
                // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
                , { readOnly: props.readOnly, path: props.path, index: index, filter: filter, stickyFilters: props.stickyFilters, active: isSamePath([...props.path, index], state.activePath) }, index));
            }), showButtons() && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: (e) => {
                            e.stopPropagation();
                            if (isEditingIncomplete()) {
                                return;
                            }
                            dispatch({ type: 'addNestedFilter', path: props.path });
                        }, className: "shrink-0", disabled: isEditingIncomplete(), variant: "ghost", size: "icon", "data-tip": "Add nested filter", "data-testid": `add-nested-filter-${props.path.join('-')}`, children: _jsx(Plus, {}) }), _jsx(Button, { onClick: (e) => {
                            e.stopPropagation();
                            dispatch({ type: 'removeNestedFilter', path: props.path });
                        }, variant: "ghost", size: "icon", "data-tip": "Remove nested filter", "data-testid": `remove-nested-filter-${props.path.join('-')}`, children: _jsx(X, {}) })] }))] }));
}
export default memo(NestedEntry);
//# sourceMappingURL=NestedEntry.js.map