/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { CommandItem } from '../../../components/ui/command';
import { cn } from '../../../lib/utils';
import { Check, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { WaveDots } from '../../../components/core/common/WaveDots';
import { useClientSession } from '../../../components/core/session-context';
export default function SavedViewItem(props) {
    const { activeView, view, onDeleteView, onSelectView } = props;
    const [busy, setBusy] = useState(false);
    const session = useClientSession();
    return (_jsxs(CommandItem, { value: view.id, "data-testid": `saved-view-item-${view.id}`, onSelect: () => {
            onSelectView(view.id === activeView?.id ? undefined : view);
        }, className: "group/view flex cursor-pointer items-center justify-between", children: [view.name, _jsxs("div", { className: "flex items-center gap-2", children: [view.isDefault && _jsx(Star, { className: "ml-auto" }), view.id === activeView?.id && _jsx(Check, { className: "ml-auto" }), (!view.isPublic || view.owner === session.userName) && (_jsx(Button, { variant: "ghost", size: "icon", "data-testid": `delete-saved-view-${view.id}`, className: cn('hidden h-4 w-4 rounded-full group-hover/view:block', {
                            visible: busy,
                        }), onClick: async (e) => {
                            try {
                                e.stopPropagation();
                                setBusy(true);
                                await onDeleteView(view.id);
                            }
                            finally {
                                setBusy(false);
                            }
                        }, children: busy ? _jsx(WaveDots, { active: true }) : _jsx(Trash2, { className: "text-red-500" }) }))] })] }, view.id));
}
//# sourceMappingURL=SavedViewItem.js.map