/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import clientLogger from '../../../lib/core/client/client-logger';
import { getErrorMessage } from '../../../lib/core/common/error';
import { memo, useState } from 'react';
import { showError } from '../../../components/core/common/Notification';
import { useIsStoreDirty } from '../../../components/core/hooks/useStoreHooks';
import { Popup } from '../../../components/core/page/popup';
import { CircleX, Loader2, Save, Trash } from 'lucide-react';
function EditPopupComponent({ store, onClose, children, footerContent, keepOpen, handleSave, onSaveSuccess, contentClassName, description = `Fill in the form and click save when you're done.`, allowDelete, ...props }) {
    const [isSaving, setIsSaving] = useState(false);
    const isDirty = useIsStoreDirty(store);
    const runSave = async (closeAfterSave) => {
        setIsSaving(true);
        try {
            if (handleSave) {
                await handleSave(closeAfterSave ? onClose : () => { });
                return;
            }
            const result = await store.save();
            if (result) {
                onSaveSuccess?.();
                if (closeAfterSave) {
                    onClose();
                }
            }
        }
        catch (error) {
            showError(`Unexpected error while saving data: ${getErrorMessage(error)}`);
            clientLogger.error({ message: 'save error', error });
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsx(Popup, { ...props, description: description, disableClose: isSaving, footer: _jsxs("div", { className: "flex w-full flex-row items-center justify-between gap-2", children: [_jsx("div", { className: "flex-1", children: footerContent }), _jsxs("div", { className: "flex flex-row gap-2", children: [_jsxs(Button, { variant: "outline", "data-testid": "edit-popup-cancel", onClick: () => {
                                store.resetStore();
                                onClose();
                            }, children: [_jsx(CircleX, { className: "h-3.5 w-3.5" }), "Cancel"] }), allowDelete && (_jsxs(Button, { type: "button", variant: "destructive", disabled: isSaving, "data-testid": "edit-popup-delete", onClick: async () => {
                                try {
                                    const id = store?.currentRowId();
                                    if (id) {
                                        if (store.isCurrentRowFromDB()) {
                                            await store.deleteRow(id);
                                            await store.save();
                                        }
                                        else {
                                            await store.deleteRow(id);
                                        }
                                        onClose();
                                    }
                                }
                                catch (error) {
                                    showError(`Unexpected error while deleting data: ${getErrorMessage(error)}`);
                                    clientLogger.error({ message: 'delete error', error });
                                }
                            }, children: [_jsx(Trash, { className: "h-4 w-4" }), "Delete"] })), keepOpen && (_jsxs(Button, { type: "button", variant: "outline", disabled: isSaving || !isDirty, "data-testid": "edit-popup-save", onClick: () => runSave(false), children: [isSaving ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : _jsx(Save, { className: "h-3.5 w-3.5" }), "Save"] })), _jsxs(Button, { type: "submit", disabled: isSaving || !isDirty, "data-testid": "edit-popup-save-close", onClick: () => runSave(true), children: [isSaving ? _jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : _jsx(Save, { className: "h-3.5 w-3.5" }), "Save & close"] })] })] }), onClose: () => {
            store.resetStore();
            onClose();
        }, children: children }));
}
export const EditPopup = memo(EditPopupComponent);
//# sourceMappingURL=edit-popup.js.map