'use client';

import { PivotContextProvider } from '@/components/core/pivot/PivotContext';
import type { PivotSetting } from '@/components/core/pivot/PivotTypes';
import { SimplePivotTable } from '@/components/core/pivot/SimplePivotTable';
import PivotCsvDownloadOptionsButton from '@/components/core/pivot/PivotCsvDownloadOptionsButton';
import PivotSettings from '@/components/core/pivot/PivotSettings';
import PageLayout from '@/components/core/page/PageLayout';
import type { SalesColumnKey, SalesRecord } from './static-sample-data';
import { STATIC_SAMPLE_DATA } from './static-sample-data';
import useStaticPivotColumns from './useStaticPivotColumns';
import { PIVOT_SETTINGS } from './pivot-settings.config';
import { useCallback, useMemo, useState } from 'react';
import PivotCsvDownloadButton from '@/components/core/pivot/PivotCsvDownloadButton';
import CsvDownloadButton from '@/components/core/CsvDownloadButton';

const initialSettings: PivotSetting<SalesColumnKey> = PIVOT_SETTINGS;

export default function PageContent() {
  const columns = useStaticPivotColumns();
  const [settings, setSettings] = useState<PivotSetting<SalesColumnKey>>(initialSettings);

  const sorters = useMemo(() => ({ date: -1 as const }), []);
  // const sorters = useMemo(() => ({ date: -1}), []);

  const getNumberValue = useCallback((item: Readonly<SalesRecord>, field: SalesColumnKey): number => {
    const value = item[field];
    if (typeof value === 'number') {
      return value;
    }
    return 0;
  }, []);

  const getTextValue = useCallback((item: Readonly<SalesRecord>, field: SalesColumnKey): string => {
    const value = item[field];
    if (value == null) return '';
    return String(value);
  }, []);

  const onSettingsChange = useCallback((newSettings: PivotSetting<SalesColumnKey>) => {
    setSettings(newSettings);
  }, []);

  return (
    <PivotContextProvider columns={columns} initialSettings={settings} onSettingsChange={onSettingsChange}>
      <PageLayout
        title="Pivot Table (Static Sample)"
        toolbar={
          <div className="flex items-center gap-2">
            <PivotSettings />
            <CsvDownloadButton data={STATIC_SAMPLE_DATA} />
            <PivotCsvDownloadButton />
            <PivotCsvDownloadOptionsButton />
          </div>
        }
      >
        <div className="relative flex h-full w-full">
          <SimplePivotTable
            hideBorders
            data={STATIC_SAMPLE_DATA}
            getNumberValue={getNumberValue}
            getTextValue={getTextValue}
            sorters={sorters}
            initialCollapsed={false}
          />
        </div>
      </PageLayout>
    </PivotContextProvider>
  );
}
