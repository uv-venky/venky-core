import { List } from 'immutable';
import type * as React from 'react';
import type { PivotData } from '../../../components/core/pivot/PivotData';
import type { DispatchFn, Filter, PivotColumn, PivotSetting, PivotState } from '../../../components/core/pivot/PivotTypes';
export declare function usePivotSettingsContext<TColumnKey extends string>(): PivotSetting<TColumnKey>;
export declare function usePivotSettingsSetterContext<TColumnKey extends string>(): React.Dispatch<React.SetStateAction<PivotSetting<TColumnKey>>>;
export declare function usePivotColumnsContext<TColumnKey extends string>(): ReadonlyArray<PivotColumn<TColumnKey>>;
export declare function usePivotUpdateColumnWidthContext<TColumnKey extends string>(): (columnKey: TColumnKey, newWidth: number) => void;
export declare function usePivotUpdateCalculatedColumnWidthContext<_TColumnKey extends string = string>(): (calculatedColumnId: string, newWidth: number) => void;
export declare function usePivotState<TColumnKey extends string, TItem>(): PivotState<TColumnKey, TItem>;
export declare function usePivotHeader(): ReadonlyArray<ReadonlyArray<string>>;
export declare function usePivotRows(): ReadonlyArray<ReadonlyArray<string | Array<string>>>;
export declare function usePivotDraftPowerSearchFilters(): List<Filter>;
export declare function usePivotStateGetter<TColumnKey extends string, TItem>(): () => PivotState<TColumnKey, TItem>;
export declare function usePivotDataContext<TColumnKey extends string, TItem>(): PivotData<TColumnKey, TItem>;
export declare function usePivotDispatcher<TColumnKey extends string, TItem>(): DispatchFn<TColumnKey, TItem>;
export declare function PivotContextProvider<TColumnKey extends string, TItem>({ children, columns, initialSettings, onSettingsChange, }: {
    children: React.ReactNode;
    columns: ReadonlyArray<PivotColumn<TColumnKey>>;
    initialSettings: PivotSetting<TColumnKey>;
    onSettingsChange?: (settings: PivotSetting<TColumnKey>) => void;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PivotContext.d.ts.map