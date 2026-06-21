import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { TableHead, TableRow } from '../../../components/ui/table';
import { DropdownMenuField } from '../../../components/core/dropdown-menu';
import { EntryEditorValueInput } from '../../../components/core/smart-search/EntryEditorValueInput';
import { getDefaultOperator, getDefaultValue, getOptionsForType, hasEditor, isMultiOperator, OPS_ICONS, } from '../../../components/core/smart-search/operators';
import { EMPTY_ARRAY, isEmpty } from '../../../lib/core/common/isEmpty';
import { FileQuestionIcon, SearchIcon, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import clientLogger from '../../../lib/core/client/client-logger';
import { useIsHeaderFilterDirty, useIsHeaderFilterApplied, useIsHeaderFiltersHidden, } from '../../../components/core/hooks/useStoreHooks';
function HeaderFilterInput({ column, store }) {
    const ref = useRef(null);
    const filter = store.getHeaderFilter(column.key);
    const op = filter ? Object.keys(filter[column.key])[0] : getDefaultOperator(column);
    const val = filter ? filter[column.key][op] : undefined; // getDefaultValue(column.type);
    const [operator, setOperator] = useState(op);
    const [value, setValue] = useState(val);
    const options = getOptionsForType(column.type);
    const Icon = OPS_ICONS[operator] ?? FileQuestionIcon;
    const isDirty = useIsHeaderFilterDirty(store, column.key);
    const isApplied = useIsHeaderFilterApplied(store, column.key);
    const isAppliedRef = useRef(false);
    useEffect(() => {
        if (!isApplied && isAppliedRef.current) {
            setValue(undefined);
            setOperator(getDefaultOperator(column));
        }
        isAppliedRef.current = isApplied;
    }, [isApplied, column]);
    return (_jsxs("div", { className: "m-1 flex items-center gap-1 rounded-sm border bg-background", children: [_jsx(DropdownMenuField, { iconTrigger: true, options: options, value: operator, getLabel: (o) => o.label, getValue: (o) => o.value, onChange: (o) => {
                    setOperator(o);
                    // check if the operator has an editor
                    if (!hasEditor(o)) {
                        store.setHeaderFilter({
                            [column.key]: { [o]: getDefaultValue(column.type) },
                        });
                    }
                    else {
                        let val = value;
                        if (isMultiOperator(o)) {
                            if (!Array.isArray(val)) {
                                if (isEmpty(val)) {
                                    val = EMPTY_ARRAY;
                                }
                                else {
                                    val = [val];
                                }
                            }
                            if (o === 'bn' && Array.isArray(val) && val.length > 2) {
                                val = val.slice(0, 2);
                            }
                        }
                        else if (Array.isArray(val)) {
                            if (val.length) {
                                val = val[0];
                            }
                            else if (column) {
                                val = getDefaultValue(column.type);
                            }
                            else {
                                val = undefined;
                            }
                        }
                        setValue(val);
                        if (!isEmpty(val)) {
                            store.setHeaderFilter({
                                [column.key]: { [o]: val },
                            });
                        }
                        setTimeout(() => {
                            ref.current?.focus();
                        }, 400);
                    }
                }, dataTestId: `header-operator-${column.key}`, children: _jsx(Icon, { "data-tip": operator, className: "size-3.5 shrink-0" }) }), _jsxs("div", { className: "flex flex-1 items-center justify-between gap-1", children: [hasEditor(operator) ? (_jsx(EntryEditorValueInput, { ref: ref, column: column, operator: operator, value: value, onChange: (v, done) => {
                            if (clientLogger.isDebugEnabled) {
                                clientLogger.debug({ message: 'onChange', value: v, done });
                            }
                            setValue(v);
                            store.setHeaderFilter({
                                [column.key]: { [operator]: v },
                            });
                            if (done) {
                                store.applyHeaderFiltersIfChanged();
                            }
                        }, className: "h-full w-full p-0", path: [] })) : (_jsx("div", { className: "flex-1" })), _jsxs("div", { className: "flex items-center", children: [(Array.isArray(value) ? value.length > 0 : !isEmpty(value) || isDirty || isApplied) && (_jsx(Button, { variant: "ghost", size: "icon", "data-testid": `header-filter-clear-${column.key}`, onClick: () => {
                                    const op = getDefaultOperator(column);
                                    setOperator(op);
                                    setValue(isMultiOperator(op) ? [] : undefined);
                                    ref.current?.focus();
                                    store.clearHeaderFilter(column.key);
                                    store.applyHeaderFiltersIfChanged();
                                }, children: _jsx(X, { className: "size-3.5" }) })), isDirty && ((Array.isArray(value) ? value.length > 0 : !isEmpty(value)) || !hasEditor(operator)) && (_jsx(Button, { variant: "ghost", size: "icon", "data-testid": `header-filter-apply-${column.key}`, onClick: () => {
                                    store.applyHeaderFiltersIfChanged();
                                }, children: _jsx(SearchIcon, { className: "size-3.5" }) }))] })] })] }));
}
export default function TableHeaderFilters({ table, store, columns }) {
    const leafColumns = table.getVisibleLeafColumns();
    const isHidden = useIsHeaderFiltersHidden(store);
    if (isHidden) {
        return null;
    }
    return (_jsx(TableRow, { className: "bg-background", children: leafColumns.map((col) => {
            const c = columns.find((s) => s.key === col.id);
            return (_jsx(TableHead, { style: { width: `var(--col-${col.id}-size)` }, className: "p-0", children: c ? _jsx(HeaderFilterInput, { column: c, store: store }) : null }, col.id));
        }) }));
}
//# sourceMappingURL=table-header-filters.js.map