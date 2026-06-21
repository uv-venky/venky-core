/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../../../../../../components/ui/dialog';
import { Button } from '../../../../../../components/ui/button';
import { Textarea } from '../../../../../../components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { showError } from '../../../../../../components/core/common/Notification';
import { getErrorMessage } from '../../../../../../lib/core/common/error';
function parsePastedData(data) {
    const lines = data
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const rows = [];
    for (const line of lines) {
        // Try tab-separated first (Excel format), then comma-separated (CSV)
        const parts = line.includes('\t') ? line.split('\t') : line.split(',').map((p) => p.trim());
        if (parts.length === 0)
            continue;
        const value = parts[0]?.trim() || '';
        const label = parts[1]?.trim() || value; // Default label to value if not provided
        const description = parts[2]?.trim() || '';
        const displayOrderStr = parts[3]?.trim();
        if (!value)
            continue; // Skip empty rows
        let displayOrder = null;
        if (displayOrderStr) {
            const parsed = Number.parseInt(displayOrderStr, 10);
            if (!Number.isNaN(parsed)) {
                displayOrder = parsed;
            }
        }
        rows.push({
            value,
            label,
            description,
            displayOrder,
        });
    }
    return rows;
}
export function BulkInsertLookupValuesDialog({ store, lookupType, open, onOpenChange, }) {
    const [pastedData, setPastedData] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [previewRows, setPreviewRows] = useState([]);
    const handlePasteChange = (value) => {
        setPastedData(value);
        if (value.trim()) {
            try {
                const parsed = parsePastedData(value);
                setPreviewRows(parsed);
            }
            catch {
                setPreviewRows([]);
            }
        }
        else {
            setPreviewRows([]);
        }
    };
    const handleSave = async () => {
        if (!pastedData.trim()) {
            showError('Please paste some data');
            return;
        }
        const parsedRows = parsePastedData(pastedData);
        if (parsedRows.length === 0) {
            showError('No valid rows found. Please check your data format.');
            return;
        }
        setIsPosting(true);
        try {
            // Validate values based on value type
            if (lookupType.valueType === 'number') {
                for (const row of parsedRows) {
                    const numValue = Number.parseFloat(row.value);
                    if (Number.isNaN(numValue)) {
                        showError(`Invalid number value: "${row.value}"`);
                        setIsPosting(false);
                        return;
                    }
                }
            }
            // Create bulk records
            const records = parsedRows.map((row) => ({
                lookupTypeId: lookupType.id,
                value: row.value,
                label: row.label,
                description: row.description || null,
                displayOrder: row.displayOrder,
                isActive: true,
            }));
            await store.createNewBulk(records);
            await store.save({ feedback: `Successfully created ${records.length} lookup value(s)` });
            setPastedData('');
            setPreviewRows([]);
            onOpenChange(false);
        }
        catch (error) {
            showError(`Failed to bulk insert values: ${getErrorMessage(error)}`);
        }
        finally {
            setIsPosting(false);
        }
    };
    const handleCancel = () => {
        setPastedData('');
        setPreviewRows([]);
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "flex max-h-[90vh] max-w-3xl flex-col", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Bulk Insert Lookup Values" }), _jsx(DialogDescription, { children: "Paste data from Excel or CSV. Format: Value, Label, Description (optional), Display Order (optional)" })] }), _jsxs("div", { className: "flex flex-1 flex-col gap-4 overflow-hidden py-4", children: [_jsxs("div", { className: "flex flex-1 flex-col gap-2", children: [_jsx("label", { htmlFor: "bulk-paste", className: "font-medium text-sm", children: "Paste Data (Tab or comma-separated)" }), _jsx(Textarea, { id: "bulk-paste", placeholder: "Value\tLabel\tDescription\tOrder\nvalue1\tLabel 1\tDescription 1\t1\nvalue2\tLabel 2\tDescription 2\t2", value: pastedData, onChange: (e) => handlePasteChange(e.target.value), className: "flex-1 font-mono text-sm", disabled: isPosting }), _jsx("p", { className: "text-muted-foreground text-xs", children: "Supports tab-separated (Excel) or comma-separated (CSV) format. First column is Value, second is Label, third is Description (optional), fourth is Display Order (optional)." })] }), previewRows.length > 0 && (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "font-medium text-sm", children: ["Preview (", previewRows.length, " row(s)):"] }), _jsx("div", { className: "max-h-48 overflow-y-auto rounded border bg-muted/50 p-2", children: _jsxs("div", { className: "space-y-1", children: [previewRows.slice(0, 10).map((row, index) => (_jsxs("div", { className: "font-mono text-muted-foreground text-xs", children: [_jsx("span", { className: "font-semibold", children: row.value }), " \u2192 ", row.label, row.description && ` (${row.description})`, row.displayOrder != null && ` [Order: ${row.displayOrder}]`] }, `${row.value}-${index}`))), previewRows.length > 10 && (_jsxs("div", { className: "text-muted-foreground text-xs italic", children: ["... and ", previewRows.length - 10, " more row(s)"] }))] }) })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: handleCancel, disabled: isPosting, children: "Cancel" }), _jsx(Button, { onClick: handleSave, disabled: isPosting || previewRows.length === 0, children: isPosting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Create ", previewRows.length > 0 ? `${previewRows.length} ` : '', "Value(s)"] })) })] })] }) }));
}
//# sourceMappingURL=bulk-insert-lookup-values-dialog.js.map