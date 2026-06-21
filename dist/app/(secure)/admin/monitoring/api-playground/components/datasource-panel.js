'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Badge } from '../../../../../../components/ui/badge';
import { ComboboxField } from '../../../../../../components/core/combobox';
import { Database, PencilOff, KeyIcon, User2, DownloadIcon, Layers } from 'lucide-react';
import { isMissingPrimaryKey, getWhoAttributesCount } from './datasource-tab';
import { Button } from '../../../../../../components/ui/button';
import { showInfo } from '../../../../../../components/core/common/Notification';
function downloadWarnings(dataSources) {
  const allWarnings = [];
  dataSources.forEach((ds) => {
    const missingPrimaryKey = isMissingPrimaryKey(ds);
    const whoAttributesCount = getWhoAttributesCount(ds);
    const warnings = [];
    if (missingPrimaryKey) {
      warnings.push('Missing primary key');
    }
    if (whoAttributesCount !== 4) {
      warnings.push(`Missing ${4 - whoAttributesCount} WHO attributes`);
    }
    if (warnings.length > 0) {
      allWarnings.push({ id: ds.id, warnings });
    }
  });
  if (allWarnings.length === 0) {
    showInfo('No warnings found');
    return;
  }
  const warningsText = allWarnings.map((warning) => `${warning.id}, ${warning.warnings.join(', ')}`).join('\n');
  const blob = new Blob([warningsText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `warnings.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
export function DataSourcePanel({ selectedDataSource, setSelectedDataSource, dataSources }) {
  return _jsxs('div', {
    className:
      'group relative shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
    children: [
      _jsx('div', {
        className: 'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent',
      }),
      _jsxs('div', {
        className: 'flex items-center justify-between border-b bg-muted/30 px-4 py-3',
        children: [
          _jsxs('div', {
            className: 'flex items-center gap-3',
            children: [
              _jsx('div', {
                className:
                  'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10',
                children: _jsx(Database, { className: 'h-4 w-4 text-violet-600 dark:text-violet-400' }),
              }),
              _jsxs('div', {
                children: [
                  _jsx('h3', { className: 'font-semibold text-sm', children: 'Data Source' }),
                  _jsx('p', { className: 'text-muted-foreground text-xs', children: 'Select a source to explore' }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              _jsxs(Badge, {
                variant: 'secondary',
                className: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
                children: [_jsx(Layers, { className: 'mr-1 h-3 w-3' }), dataSources.length],
              }),
              _jsx(Button, {
                variant: 'ghost',
                size: 'icon',
                'data-tip': 'Download Warnings',
                onClick: () => downloadWarnings(dataSources),
                className: 'h-8 w-8 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600',
                children: _jsx(DownloadIcon, { className: 'h-4 w-4' }),
              }),
            ],
          }),
        ],
      }),
      _jsx('div', {
        className: 'p-4',
        children: _jsx(ComboboxField, {
          value: selectedDataSource,
          options: dataSources,
          getValue: (ds) => ds.id,
          getLabel: (ds) => ds.id,
          onSelect: (value) => {
            if (value) setSelectedDataSource(value);
          },
          placeholder: 'Search data sources...',
          searchPlaceholder: 'Type to search...',
          emptyText: 'No data sources found',
          className:
            'w-full border-violet-200/50 transition-colors focus-within:border-violet-400 dark:border-violet-500/20',
          getIcon: (ds) =>
            _jsxs('div', {
              className: 'flex items-center gap-1.5',
              children: [
                ds.readOnly &&
                  _jsx('span', {
                    'data-tip': 'Read Only',
                    className: 'text-muted-foreground',
                    children: _jsx(PencilOff, { className: 'h-3.5 w-3.5' }),
                  }),
                isMissingPrimaryKey(ds) &&
                  _jsx('span', {
                    'data-tip': 'Missing primary key',
                    className: 'text-amber-500',
                    children: _jsx(KeyIcon, { className: 'h-3.5 w-3.5' }),
                  }),
                getWhoAttributesCount(ds) !== 4 &&
                  _jsxs('span', {
                    'data-tip': `Missing ${4 - getWhoAttributesCount(ds)} WHO attributes`,
                    className: 'flex items-center gap-0.5 text-amber-500 text-xs',
                    children: [
                      _jsx(User2, { className: 'h-3.5 w-3.5' }),
                      _jsx('span', { className: 'font-medium', children: 4 - getWhoAttributesCount(ds) }),
                    ],
                  }),
              ],
            }),
        }),
      }),
    ],
  });
}
//# sourceMappingURL=datasource-panel.js.map
