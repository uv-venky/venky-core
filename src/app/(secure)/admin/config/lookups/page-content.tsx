/* Copyright (c) 2024-present Venky Corp. */

'use client';

import PageLayout from '@/components/core/page/PageLayout';
import { LookupTypesPanel } from './components/lookup-types-panel';
import { LookupValuesPanel } from './components/lookup-values-panel';
import { useState } from 'react';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';

export default function LookupsPageContent() {
  const [selectedLookupType, setSelectedLookupType] = useState<LookupTypes | null>(null);

  return (
    <PageLayout
      title="Lookups"
      subTitle="Manage lookup types and values"
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-2xl text-primary">
          L
        </div>
      }
    >
      <div className="flex h-[calc(100vh-200px)] gap-4 p-4">
        <div className="w-1/3 border-r pr-4">
          <LookupTypesPanel selectedLookupType={selectedLookupType} onSelectLookupType={setSelectedLookupType} />
        </div>
        <div className="flex-1">
          <LookupValuesPanel lookupType={selectedLookupType} />
        </div>
      </div>
    </PageLayout>
  );
}
