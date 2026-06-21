import type { DispatchFn, PivotState } from '../../../components/core/pivot/PivotTypes';
export default function usePivotReducer<TColumnKey extends string, TItem>(): [
    PivotState<TColumnKey, TItem>,
    DispatchFn<TColumnKey, TItem>
];
//# sourceMappingURL=usePivotReducer.d.ts.map