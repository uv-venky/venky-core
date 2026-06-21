import type { buttonVariants } from '../../../components/ui/button';
import type { Table } from '@tanstack/react-table';
import type { VariantProps } from 'class-variance-authority';
import type { Store } from '../../../lib/core/common/types/Store';
export declare function TablePersonalization<T extends object>({ table, variant, className, pageId, itemId, store, }: {
    table: Table<T>;
    variant?: VariantProps<typeof buttonVariants>['variant'];
    className?: string;
    pageId: string;
    itemId: string;
    store: Store<T>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=table-personalization.d.ts.map