'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PivotContextProvider } from '../../../../../components/core/pivot/PivotContext';
import { SimplePivotTable } from '../../../../../components/core/pivot/SimplePivotTable';
import PivotCsvDownloadOptionsButton from '../../../../../components/core/pivot/PivotCsvDownloadOptionsButton';
import PivotSettings from '../../../../../components/core/pivot/PivotSettings';
import PageLayout from '../../../../../components/core/page/PageLayout';
import { STATIC_SAMPLE_DATA } from './static-sample-data';
import useStaticPivotColumns from './useStaticPivotColumns';
import { PIVOT_SETTINGS } from './pivot-settings.config';
import { useCallback, useMemo, useState } from 'react';
import PivotCsvDownloadButton from '../../../../../components/core/pivot/PivotCsvDownloadButton';
import CsvDownloadButton from '../../../../../components/core/CsvDownloadButton';
const initialSettings = PIVOT_SETTINGS;
export default function PageContent() {
    const columns = useStaticPivotColumns();
    const [settings, setSettings] = useState(initialSettings);
    const sorters = useMemo(() => ({ date: -1 }), []);
    // const sorters = useMemo(() => ({ date: -1}), []);
    const getNumberValue = useCallback((item, field) => {
        const value = item[field];
        if (typeof value === 'number') {
            return value;
        }
        return 0;
    }, []);
    const getTextValue = useCallback((item, field) => {
        const value = item[field];
        if (value == null)
            return '';
        return String(value);
    }, []);
    const onSettingsChange = useCallback((newSettings) => {
        setSettings(newSettings);
    }, []);
    return (_jsx(PivotContextProvider, { columns: columns, initialSettings: settings, onSettingsChange: onSettingsChange, children: _jsx(PageLayout, { title: "Pivot Table (Static Sample)", toolbar: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(PivotSettings, {}), _jsx(CsvDownloadButton, { data: STATIC_SAMPLE_DATA }), _jsx(PivotCsvDownloadButton, {}), _jsx(PivotCsvDownloadOptionsButton, {})] }), children: _jsx("div", { className: "relative flex h-full w-full", children: _jsx(SimplePivotTable, { hideBorders: true, data: STATIC_SAMPLE_DATA, getNumberValue: getNumberValue, getTextValue: getTextValue, sorters: sorters, initialCollapsed: false }) }) }) }));
}
//# sourceMappingURL=page-content.js.map