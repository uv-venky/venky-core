/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import type { LookupValues } from '@/lib/common/ds/types/core/LookupValues';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import type { Store } from '@/lib/core/common/types/Store';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';

interface BulkInsertLookupValuesDialogProps {
  store: Store<LookupValues>;
  lookupType: LookupTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  value: string;
  label: string;
  description: string;
  displayOrder: number | null;
}

function parsePastedData(data: string): ParsedRow[] {
  const lines = data
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const rows: ParsedRow[] = [];

  for (const line of lines) {
    // Try tab-separated first (Excel format), then comma-separated (CSV)
    const parts = line.includes('\t') ? line.split('\t') : line.split(',').map((p) => p.trim());

    if (parts.length === 0) continue;

    const value = parts[0]?.trim() || '';
    const label = parts[1]?.trim() || value; // Default label to value if not provided
    const description = parts[2]?.trim() || '';
    const displayOrderStr = parts[3]?.trim();

    if (!value) continue; // Skip empty rows

    let displayOrder: number | null = null;
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

export function BulkInsertLookupValuesDialog({
  store,
  lookupType,
  open,
  onOpenChange,
}: BulkInsertLookupValuesDialogProps) {
  const [pastedData, setPastedData] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);

  const handlePasteChange = (value: string) => {
    setPastedData(value);
    if (value.trim()) {
      try {
        const parsed = parsePastedData(value);
        setPreviewRows(parsed);
      } catch {
        setPreviewRows([]);
      }
    } else {
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
      const records: Partial<LookupValues>[] = parsedRows.map((row) => ({
        lookupTypeId: lookupType.id,
        value: row.value,
        label: row.label,
        description: row.description || null,
        displayOrder: row.displayOrder,
        isActive: true,
      }));

      await store.createNewBulk(records as LookupValues[]);
      await store.save({ feedback: `Successfully created ${records.length} lookup value(s)` });

      setPastedData('');
      setPreviewRows([]);
      onOpenChange(false);
    } catch (error) {
      showError(`Failed to bulk insert values: ${getErrorMessage(error)}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    setPastedData('');
    setPreviewRows([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Insert Lookup Values</DialogTitle>
          <DialogDescription>
            Paste data from Excel or CSV. Format: Value, Label, Description (optional), Display Order (optional)
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden py-4">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="bulk-paste" className="font-medium text-sm">
              Paste Data (Tab or comma-separated)
            </label>
            <Textarea
              id="bulk-paste"
              placeholder="Value&#9;Label&#9;Description&#9;Order&#10;value1&#9;Label 1&#9;Description 1&#9;1&#10;value2&#9;Label 2&#9;Description 2&#9;2"
              value={pastedData}
              onChange={(e) => handlePasteChange(e.target.value)}
              className="flex-1 font-mono text-sm"
              disabled={isPosting}
            />
            <p className="text-muted-foreground text-xs">
              Supports tab-separated (Excel) or comma-separated (CSV) format. First column is Value, second is Label,
              third is Description (optional), fourth is Display Order (optional).
            </p>
          </div>

          {previewRows.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="font-medium text-sm">Preview ({previewRows.length} row(s)):</div>
              <div className="max-h-48 overflow-y-auto rounded border bg-muted/50 p-2">
                <div className="space-y-1">
                  {previewRows.slice(0, 10).map((row, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: pasted rows can have duplicate values
                    <div key={`${row.value}-${index}`} className="font-mono text-muted-foreground text-xs">
                      <span className="font-semibold">{row.value}</span> → {row.label}
                      {row.description && ` (${row.description})`}
                      {row.displayOrder != null && ` [Order: ${row.displayOrder}]`}
                    </div>
                  ))}
                  {previewRows.length > 10 && (
                    <div className="text-muted-foreground text-xs italic">
                      ... and {previewRows.length - 10} more row(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPosting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPosting || previewRows.length === 0}>
            {isPosting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create {previewRows.length > 0 ? `${previewRows.length} ` : ''}Value(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
