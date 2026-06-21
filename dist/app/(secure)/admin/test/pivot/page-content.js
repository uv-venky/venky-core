'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import Suspended from '../../../../../components/core/common/Suspended';
import { useIsStoreLoading, useRows } from '../../../../../components/core/hooks/useStoreHooks';
import { PivotContextProvider } from '../../../../../components/core/pivot/PivotContext';
import { SimplePivotTable } from '../../../../../components/core/pivot/SimplePivotTable';
import { isSingleFilter, } from '../../../../../lib/core/common/ds/types/filter';
import { isEmpty, keys } from '../../../../../lib/core/common/isEmpty';
import { format, parse } from 'date-fns';
import { useRouter } from '../../../../../components/core/hooks/useRouter';
import { Suspense, useCallback, useState } from 'react';
import usePivotColumns from './usePivotColumns';
import useSmartSearchColumns from './useSmartSearchColumns';
import { useStore } from '../../../../../lib/core/client/store';
import { PivotFilters } from '../../../../../components/core/page/filters';
import PivotSettings from '../../../../../components/core/pivot/PivotSettings';
import PageLayout from '../../../../../components/core/page/PageLayout';
import { PivotTableSkeleton } from '../../../../../components/core/pivot/pivot-table-skeleton';
import logger from '../../../../../lib/core/client/client-logger';
const initialSettings = {
    aggregatorName: 'Count',
    rows: ['displayName'],
    cols: ['email'],
    values: ['userId'],
    density: 'compact',
};
const DATE_FORMAT = 'MM/dd/yyyy';
function usePivotStore() {
    return useStore({
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
    const [settings, setSettings] = useState(initialSettings);
    const router = useRouter();
    const executeQuery = useCallback((settings) => {
        const query = {};
        const groupBy = Array.from(new Set([...settings.rows, ...settings.cols]));
        query.groupBy = groupBy;
        query.aggregate = settings.values.map((val) => {
            let func = 'Count';
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
        });
        store.executeQuery({ query });
    }, [store]);
    const onValueCellClick = useCallback((formattedValue, context) => {
        if (isEmpty(formattedValue)) {
            return;
        }
        const contextKeys = keys(context);
        const filters = store.smartSearchFilters().filter((f) => {
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
            const attribute = store.getAttribute(key);
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
    }, [store, router]);
    const getNumberValue = useCallback((item, field) => {
        const value = item[field];
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
    const getTextValue = useCallback((item, field) => {
        const value = item[field];
        if (value == null) {
            return '';
        }
        const attr = store.getAttribute(field);
        if (attr) {
            if (attr.type === 'Date') {
                return format(new Date(`${value.split('T')[0]}T12:00:00Z`), DATE_FORMAT);
            }
        }
        if (typeof value === 'string') {
            return value;
        }
        return String(value);
    }, [store]);
    const getTotalLabel = useCallback((props) => {
        if (props.aggregatorName === 'Count' && props.values.length === 1 && props.values[0] === 'userId') {
            if (props.location === 'header') {
                return 'Vendor Deals';
            }
            else {
                return 'Grand Total';
            }
        }
        return props.defaultLabel;
    }, []);
    const getCellStyle = useCallback((props) => {
        if (props.data.startColumnIndex > 0) {
            if (isEmpty(props.formattedValue)) {
                return 'cursor-default';
            }
            return 'text-blue-500';
        }
        return undefined;
    }, []);
    const onSettingsChange = useCallback((settings) => {
        setSettings(settings);
        executeQuery(settings);
    }, [executeQuery]);
    return (_jsx(PivotContextProvider, { columns: columns, initialSettings: settings, onSettingsChange: onSettingsChange, children: _jsx(PageLayout, { title: "Users Pivot", toolbar: _jsx(PivotSettings, {}), filterSection: _jsx(Suspense, { fallback: _jsx(Suspended, { name: "Filters" }), children: _jsx(PivotFilters, { border: "none", store: store, columns: smartSearchColumns, pageId: "users-pivot", itemId: "users-pivot", settings: settings, onSearch: async ({ settings: savedSettings }) => {
                        // filters are already set in the store
                        if (savedSettings) {
                            setSettings(savedSettings);
                        }
                        executeQuery(savedSettings ?? settings);
                    } }) }), children: _jsx("div", { className: "relative flex h-full w-full", children: isStoreLoading ? (_jsx(PivotTableSkeleton, {})) : (_jsx(SimplePivotTable, { hideBorders: true, data: rows, getNumberValue: getNumberValue, getTextValue: getTextValue, initialCollapsed: false, onValueCellClick: onValueCellClick, getTotalLabel: getTotalLabel, getCellStyle: getCellStyle })) }) }) }));
}
//# sourceMappingURL=page-content.js.map