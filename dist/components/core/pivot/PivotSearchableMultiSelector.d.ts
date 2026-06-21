import type { PivotSearchAsyncSource } from '../../../components/core/pivot/PivotSearchAsyncSource';
export type PivotSearchableMultiSelectorProps<Item, ColumnKey extends string> = {
    searchSource: PivotSearchAsyncSource<Item, ColumnKey>;
    value: string[];
    onChange: (value: ReadonlyArray<string>) => void;
    buttonSize?: 'compact' | 'default';
    className?: string;
    visible?: boolean;
};
export default function PivotSearchableMultiSelector<Item, ColumnKey extends string>({ searchSource, value, onChange, className, visible, }: PivotSearchableMultiSelectorProps<Item, ColumnKey>): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=PivotSearchableMultiSelector.d.ts.map