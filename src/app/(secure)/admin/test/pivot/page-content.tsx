'use client';

import Suspended from '@/components/core/common/Suspended';
import { useIsStoreLoading, useRows } from '@/components/core/hooks/useStoreHooks';
import { PivotContextProvider } from '@/components/core/pivot/PivotContext';
import type { CellXStyleCallback, PivotSetting } from '@/components/core/pivot/PivotTypes';
import { SimplePivotTable } from '@/components/core/pivot/SimplePivotTable';
import {
  isSingleFilter,
  type Aggregate,
  type AggregateFunction,
  type FilterEntry,
  type Query,
  type Row,
} from '@/lib/core/common/ds/types/filter';
import { isEmpty, keys } from '@/lib/core/common/isEmpty';
import { format, parse } from 'date-fns';
import { useRouter } from '@/components/core/hooks/useRouter';
import { Suspense, useCallback, useState } from 'react';
import usePivotColumns from './usePivotColumns';
import useSmartSearchColumns from './useSmartSearchColumns';
import type { Users } from '@/lib/common/ds/types/core/Users';
import { useStore } from '@/lib/core/client/store';
import { PivotFilters } from '@/components/core/page/filters';
import PivotSettings from '@/components/core/pivot/PivotSettings';
import PageLayout from '@/components/core/page/PageLayout';
import { PivotTableSkeleton } from '@/components/core/pivot/pivot-table-skeleton';
import type { AggregatorNames } from '@/components/core/pivot/PivotUtils';
import logger from '@/lib/core/client/client-logger';

const initialSettings: PivotSetting<keyof Users> = {
  aggregatorName: 'Count',
  rows: ['displayName'],
  cols: ['email'],
  values: ['userId'],
  density: 'compact',
};

const DATE_FORMAT = 'MM/dd/yyyy';

function usePivotStore() {
  return useStore<Users>({
    datasourceId: 'Users',
    page: 'users-pivot-page',
    alias: 'users-pivot-all',
    limit: 20000,
    onInitialized: async (store) => {
      store.setIsLoading(false);
    },
  });
}

export default function PageContent() {
  const store = usePivotStore();
  const isStoreLoading = useIsStoreLoading(store);
  const rows = useRows(store);
  const smartSearchColumns = useSmartSearchColumns();
  const columns = usePivotColumns();
  const [settings, setSettings] = useState<PivotSetting<keyof Users>>(initialSettings);
  const router = useRouter();

  const executeQuery = useCallback(
    (settings: PivotSetting<keyof Users>) => {
      const query: Query<Users> = {};
      const groupBy = Array.from(new Set([...settings.rows, ...settings.cols]));
      query.groupBy = groupBy;
      query.aggregate = settings.values.map((val) => {
        let func: AggregateFunction = 'Count';
        switch (settings.aggregatorName) {
          case 'Count':
            func = 'Count';
            break;
          case 'Sum':
            func = 'Sum';
            break;
          case 'Average':
            func = 'Avg';
            break;
          case 'Minimum':
            func = 'Min';
            break;
          case 'Maximum':
            func = 'Max';
            break;
          case 'Unique Count':
            func = 'DistinctCount';
            break;
          case 'Integer Sum':
            func = 'Sum';
            break;
          default:
            throw new Error(`Unknown aggregator name: ${settings.aggregatorName}`);
        }
        return {
          code: val,
          func,
          intoCode: val,
        };
      }) satisfies Aggregate<Users>[];
      store.executeQuery({ query });
    },
    [store],
  );

  const onValueCellClick = useCallback(
    (formattedValue: string | string[], context: Partial<Record<keyof Users, string>>) => {
      if (isEmpty(formattedValue)) {
        return;
      }
      const contextKeys = keys(context);
      const filters: FilterEntry<Users>[] = store.smartSearchFilters().filter((f) => {
        if (isSingleFilter(f) && contextKeys.includes(keys(f)[0])) {
          return false;
        }
        return true;
      });
      contextKeys.forEach((key) => {
        const value = context[key];
        if (!value) {
          return;
        }
        const attribute = store.getAttribute(key as keyof Users);
        if (attribute) {
          switch (attribute.type) {
            case 'Date': {
              const adDate = parse(value, DATE_FORMAT, new Date());
              adDate.setHours(12, 0, 0, 0);
              // filters.push({ adDate: { on: adDate.toISOString() } });
              break;
            }
            case 'Number':
              filters.push({ [key]: { eq: Number(value) } });
              break;
            default:
              filters.push({ [key]: { is: value } });
              break;
          }
        }
      });

      const filterString = JSON.stringify(filters);
      const encodedFilterString = Buffer.from(filterString).toString('base64');
      router.push(`/cdm/maintenance/ad-item-summary?sc=${encodedFilterString}`);
    },
    [store, router],
  );

  const getNumberValue = useCallback((item: Row<Users>, field: keyof Users) => {
    const value = item[field as keyof typeof item] as number;
    if (typeof value === 'number') {
      return value;
    }
    if (!isEmpty(value)) {
      logger.error({
        message: `Invalid number value for field: ${field}: ${value} of type ${typeof value}`,
      });
    }
    return 0;
  }, []);

  const getTextValue = useCallback(
    (item: Row<Users>, field: keyof Users) => {
      const value = item[field as keyof typeof item] as string;
      if (value == null) {
        return '';
      }
      const attr = store.getAttribute(field as keyof Users);
      if (attr) {
        if (attr.type === 'Date') {
          return format(new Date(`${(value as string).split('T')[0]}T12:00:00Z`), DATE_FORMAT);
        }
      }
      if (typeof value === 'string') {
        return value;
      }
      return String(value);
    },
    [store],
  );

  const getTotalLabel = useCallback(
    (props: {
      aggregatorName: AggregatorNames;
      defaultLabel: string;
      values: Array<keyof Users>;
      location: 'header' | 'footer';
    }) => {
      if (props.aggregatorName === 'Count' && props.values.length === 1 && props.values[0] === 'userId') {
        if (props.location === 'header') {
          return 'Vendor Deals';
        } else {
          return 'Grand Total';
        }
      }
      return props.defaultLabel;
    },
    [],
  );

  const getCellStyle: CellXStyleCallback<keyof Users, Row<Users>> = useCallback((props) => {
    if (props.data.startColumnIndex > 0) {
      if (isEmpty(props.formattedValue)) {
        return 'cursor-default';
      }
      return 'text-blue-500';
    }
    return undefined;
  }, []);

  const onSettingsChange = useCallback(
    (settings: PivotSetting<keyof Users>) => {
      setSettings(settings);
      executeQuery(settings);
    },
    [executeQuery],
  );

  return (
    <PivotContextProvider columns={columns} initialSettings={settings} onSettingsChange={onSettingsChange}>
      <PageLayout
        title="Users Pivot"
        toolbar={<PivotSettings />}
        filterSection={
          <Suspense fallback={<Suspended name="Filters" />}>
            <PivotFilters
              border="none"
              store={store}
              columns={smartSearchColumns}
              pageId="users-pivot"
              itemId="users-pivot"
              settings={settings}
              onSearch={async ({ settings: savedSettings }) => {
                // filters are already set in the store
                if (savedSettings) {
                  setSettings(savedSettings);
                }
                executeQuery(savedSettings ?? settings);
              }}
            />
          </Suspense>
        }
      >
        <div className="relative flex h-full w-full">
          {isStoreLoading ? (
            <PivotTableSkeleton />
          ) : (
            <SimplePivotTable
              hideBorders
              data={rows}
              getNumberValue={getNumberValue}
              getTextValue={getTextValue}
              initialCollapsed={false}
              onValueCellClick={onValueCellClick}
              getTotalLabel={getTotalLabel}
              getCellStyle={getCellStyle}
              // CellRenderer={CellRenderer}
            />
          )}
        </div>
      </PageLayout>
    </PivotContextProvider>
  );
}

// function CellRenderer(props: CellProps<Users, keyof Users>) {
//   const { formattedValue, data, columnIndex, children } = props;
//   if (data.startColumnIndex === 0 && data.data.pivot.config.rows[columnIndex] === 'versionLevel') {
//     if (typeof formattedValue === 'string' && !SPANS.includes(formattedValue)) {
//       const versionLevel = parseInt(formattedValue);
//       return <span style={{ paddingLeft: (versionLevel - 1) * 16 }}>{children}</span>;
//     }
//   }
//   return children;
// }
