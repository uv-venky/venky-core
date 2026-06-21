import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '../../../components/ui/command';
import { memo, useEffect } from 'react';
import { Combobox } from '../../../components/core/combobox';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import { COMBINER_OPTIONS } from '../../../components/core/smart-search/SmartSearchTypes';
import { useSmartSearchColumns, useSmartSearchDispatcher } from '../../../components/core/smart-search/context';
import { ALargeSmall, Calendar, Check, Hash, List, FileQuestion, Zap } from 'lucide-react';
function ColumnList(props) {
    useWhyDidYouUpdate('ColumnList', props);
    const { attributeCode, index, path, open, onOpenChange, stickyFilters } = props;
    const columns = useSmartSearchColumns();
    const dispatch = useSmartSearchDispatcher();
    useEffect(() => {
        if (!attributeCode) {
            onOpenChange?.(true);
        }
    }, [attributeCode, onOpenChange]);
    return (_jsx(Combobox, { open: open, onOpenChange: onOpenChange, options: columns.filter((c) => !stickyFilters?.includes(c.key)), value: attributeCode, getLabel: (o) => o.label, getValue: (o) => o.key, groupHeading: "Fields", placeholder: "Select a field", searchPlaceholder: "Search for a field...", required: true, dataTestId: "field-selector", onSelect: (key) => {
            const column = columns.find((c) => c.key === key);
            if (!column) {
                throw new Error(`Column not found: ${key}`);
            }
            dispatch({
                type: 'setColumn',
                path: path,
                index: index,
                column,
            });
            onOpenChange?.(false);
        }, getIcon: (o) => {
            let icon = _jsx(FileQuestion, { className: "h-3 w-3" });
            switch (o.type) {
                case 'Number':
                    icon = _jsx(Hash, { className: "h-3 w-3" });
                    break;
                case 'Date':
                    icon = _jsx(Calendar, { className: "h-3 w-3" });
                    break;
                case 'Boolean':
                case 'YN':
                case 'TF':
                    icon = _jsx(Check, { className: "h-3 w-3" });
                    break;
                case 'Select':
                case 'TextArray':
                    icon = _jsx(List, { className: "h-3 w-3" });
                    break;
                case 'Text':
                    icon = _jsx(ALargeSmall, { className: "h-3 w-3" });
                    break;
            }
            return icon;
        }, className: "border-none", bottomGroup: _jsxs(_Fragment, { children: [_jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Nested filters", children: COMBINER_OPTIONS.map((o) => (_jsxs(CommandItem, { value: o.value, className: "flex cursor-pointer items-center justify-between", "data-testid": `combiner-${o.value}`, onSelect: () => {
                            dispatch({
                                type: 'newCombiner',
                                path: [...path, index],
                                combiner: o.value,
                            });
                        }, children: [_jsx(Zap, { className: "h-3 w-3" }), _jsx("span", { className: "whitespace-nowrap", children: o.label }), _jsx(CommandShortcut, { className: "justify-end justify-self-end whitespace-nowrap text-xs", children: o.hint })] }, o.value))) })] }) }));
}
export default memo(ColumnList);
//# sourceMappingURL=ColumnList.js.map