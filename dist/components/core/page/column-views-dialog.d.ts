import type { buttonVariants } from '../../../components/ui/button';
import type { TableColumnPreferences } from '../../../components/core/page/table-column-preferences';
import type { Table } from '@tanstack/react-table';
import type { VariantProps } from 'class-variance-authority';
export declare function ColumnViewsDialog<T extends object>({ table, preferences: preferencesProp, onPreferencesChange: onPreferencesChangeProp, variant, iconOnly, className, defaultPreferences, }: {
    table: Table<T>;
    preferences?: TableColumnPreferences;
    onPreferencesChange?: (prefs: TableColumnPreferences) => void;
    variant?: VariantProps<typeof buttonVariants>['variant'];
    iconOnly?: boolean;
    className?: string;
    defaultPreferences?: Partial<TableColumnPreferences>;
}): import("react/jsx-runtime").JSX.Element;
export default ColumnViewsDialog;
//# sourceMappingURL=column-views-dialog.d.ts.map