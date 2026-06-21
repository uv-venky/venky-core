import { type Row, type Table as TableType } from '@tanstack/react-table';
import * as React from 'react';
import type { Store } from '../../../lib/core/common/types/Store';
import type { Column } from '../../../components/core/smart-search/types';
import type { TableVariant } from '../../../components/core/common/types';
type Props<T extends object> = {
    table: TableType<T>;
    onRowClick?: (row: Row<T>) => void;
    onEdit?: (rowId: string) => void;
    variant?: TableVariant;
    store: Store<T>;
    loadingRows?: number;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
    hideCurrentRowIndicator?: boolean;
    smartSearchColumns?: Column<T>[];
    reorderable?: boolean;
    draggable?: boolean;
    droppable?: boolean;
    renderSubComponent?: (props: {
        row: Row<T>;
    }) => React.ReactNode;
};
declare const _default: <T extends object>(props: Props<T>) => React.ReactElement;
export default _default;
//# sourceMappingURL=table.d.ts.map