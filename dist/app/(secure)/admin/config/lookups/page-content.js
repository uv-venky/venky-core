/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import PageLayout from '../../../../../components/core/page/PageLayout';
import { LookupTypesPanel } from './components/lookup-types-panel';
import { LookupValuesPanel } from './components/lookup-values-panel';
import { useState } from 'react';
export default function LookupsPageContent() {
  const [selectedLookupType, setSelectedLookupType] = useState(null);
  return _jsx(PageLayout, {
    title: 'Lookups',
    subTitle: 'Manage lookup types and values',
    icon: _jsx('div', {
      className: 'flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-2xl text-primary',
      children: 'L',
    }),
    children: _jsxs('div', {
      className: 'flex h-[calc(100vh-200px)] gap-4 p-4',
      children: [
        _jsx('div', {
          className: 'w-1/3 border-r pr-4',
          children: _jsx(LookupTypesPanel, {
            selectedLookupType: selectedLookupType,
            onSelectLookupType: setSelectedLookupType,
          }),
        }),
        _jsx('div', { className: 'flex-1', children: _jsx(LookupValuesPanel, { lookupType: selectedLookupType }) }),
      ],
    }),
  });
}
//# sourceMappingURL=page-content.js.map
