type ColumnOption = {
    value: string;
    label: string;
};
export declare function ColumnViewsColumnsTab({ columnOptions, displayedColumnIds, onDisplayedChange, onRestore, }: {
    columnOptions: ColumnOption[];
    displayedColumnIds: string[];
    onDisplayedChange: (ids: string[], visibilityUpdates: Record<string, boolean>) => void;
    onRestore: () => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=column-views-columns-tab.d.ts.map