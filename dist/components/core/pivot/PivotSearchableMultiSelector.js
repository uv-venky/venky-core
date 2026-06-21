'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { MultiCombobox } from '../../../components/core/multi-combobox';
import { cn } from '../../../lib/utils';
import { FunnelIcon } from 'lucide-react';
export default function PivotSearchableMultiSelector({ searchSource, value, onChange, 
//buttonSize = 'compact',
className, visible = true, }) {
    const [open, setOpen] = useState(false);
    const options = useMemo(() => {
        const unique = new Set();
        searchSource.data.forEach((row) => {
            unique.add(searchSource.getTextValue(row, searchSource.key));
        });
        return Array.from(unique).sort();
    }, [searchSource]);
    if (!visible) {
        return null;
    }
    return (_jsx(MultiCombobox, { open: open, onOpenChange: setOpen, value: value, onSelect: (vals) => onChange(vals), options: options, getLabel: (v) => v, getValue: (v) => v, placeholder: "", searchPlaceholder: "Search...", minSearchLength: 0, disableSortByLabel: true, trigger: _jsx(FunnelIcon, { className: cn('mr-4 size-3.5 cursor-pointer group-hover/resizable:visible', open || value.length > 0 ? 'visible' : 'invisible', value.length > 0 && 'text-blue-600', className) }) }));
}
//# sourceMappingURL=PivotSearchableMultiSelector.js.map