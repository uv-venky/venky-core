/** Table layout preferences stored in saved search `payload.custom`. */
export interface SavedTableColumnCustom {
    columnOrder?: string[];
    columnVisibility?: Record<string, boolean>;
    columnSizing?: Record<string, number>;
    tableVariant?: 'compact' | 'default' | 'roomy' | 'spacious';
    stickyLeftCount?: 0 | 1 | 2 | 3;
    stickyRightCount?: 0 | 1 | 2 | 3;
    pageSize?: number;
    /** Feature-specific payload (e.g. pivot layout settings). */
    settings?: unknown;
}
//# sourceMappingURL=SavedTableColumnCustom.d.ts.map