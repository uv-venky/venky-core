/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import useTheme from '../../../../../../components/core/hooks/useTheme';
import { Popup } from '../../../../../../components/core/page/popup';
import '../../../../../../lib/monaco-setup';
import { DiffEditor } from '@monaco-editor/react';
import { useMemo } from 'react';
import { getAuditDiffTexts } from '../../../../../../app/(secure)/admin/monitoring/audit/lib/audit-value-diff';
function rowToValueData(row) {
  return {
    valueType: row.valueType,
    oldStringValue: row.oldStringValue,
    newStringValue: row.newStringValue,
    oldDoubleValue: row.oldDoubleValue,
    newDoubleValue: row.newDoubleValue,
    oldDatetimeValue: row.oldDatetimeValue,
    newDatetimeValue: row.newDatetimeValue,
    oldClobValue: row.oldClobValue,
    newClobValue: row.newClobValue,
    attributeCode: row.attributeCode,
  };
}
export function AuditValueDiffDialog({ store, rowId, onClose }) {
  const row = store.row(rowId);
  const { theme } = useTheme();
  const meta = useMemo(() => {
    if (!row) {
      return null;
    }
    const valueData = rowToValueData(row);
    const diff = getAuditDiffTexts(valueData);
    const parts = [
      row.datasourceId,
      row.attributeCode ? `· ${row.attributeCode}` : null,
      row.pkValue ? `· ${row.pkValue}` : null,
    ].filter(Boolean);
    return {
      description: parts.join(' '),
      ...diff,
    };
  }, [row]);
  if (!row || !meta) {
    return null;
  }
  return _jsx(Popup, {
    title: 'Value diff',
    description: meta.description,
    onClose: onClose,
    width: 1220,
    height: 640,
    minWidth: 520,
    minHeight: 360,
    bodyClassName: 'flex min-h-0 flex-1 flex-col overflow-hidden pb-4',
    children: _jsx('div', {
      className: 'min-h-0 flex-1 overflow-hidden rounded-md border border-border/60',
      children: _jsx(DiffEditor, {
        height: '100%',
        language: meta.language,
        theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
        original: meta.oldText,
        modified: meta.newText,
        options: {
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          fontSize: 13,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        },
      }),
    }),
  });
}
//# sourceMappingURL=audit-value-diff-dialog.js.map
