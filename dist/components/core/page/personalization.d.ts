import { type buttonVariants } from '../../../components/ui/button';
import type { SavedSearchPayload } from '../../../lib/common/ds/types/core/SavedSearch';
import type { VariantProps } from 'class-variance-authority';
import type { Table } from '@tanstack/react-table';
import type { Store } from '../../../lib/core/common/types/Store';
export type PersonalizationTab = {
    key: string;
    label: string;
    tabContent: React.ReactNode;
    onSelectView: (payload?: SavedSearchPayload<unknown>) => void;
    updatePayload: (payload: SavedSearchPayload<unknown>) => SavedSearchPayload<unknown>;
};
export declare function Personalization({ variant, className, pageId, itemId, tabs, store, }: {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    className?: string;
    pageId: string;
    itemId: string;
    tabs: Array<PersonalizationTab>;
    store: Store<any>;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTableColumnsPersonalizationTab<T extends object>(table: Table<T>): PersonalizationTab;
export declare function useTableDensityPersonalizationTab<T extends object>(table: Table<T>): PersonalizationTab;
export declare function useTableStickyPersonalizationTab<T extends object>(table: Table<T>): PersonalizationTab;
//# sourceMappingURL=personalization.d.ts.map