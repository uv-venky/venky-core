import type { Store } from '../../../lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { type ReactNode } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
import type { NewRow } from '../../../lib/core/common/ds/types/filter';
type Props<T extends object> = {
    store: Store<T>;
    filterStartContent?: ReactNode;
    filterEndContent?: ReactNode;
    hideColumnsMenu?: boolean;
    hideFilters?: boolean;
    hidePagination?: boolean;
    smartSearchColumns: Column<T>[];
    tableColumns: AccessorKeyColumnDef<T>[];
    pageId: string;
    itemId: string;
    title: string;
    subTitle: string;
    icon: ReactNode;
    editForm?: ReactNode;
    getDefaultRow?: () => NewRow<T>;
    addNewButtonText?: string;
    editFormProportion?: number;
    headerEndContent?: ReactNode;
};
export default function PageWithFormTemplate<T extends object>({ store, filterStartContent, filterEndContent, hideColumnsMenu, hideFilters, hidePagination, smartSearchColumns, tableColumns, pageId, itemId, title, subTitle, icon, editForm, getDefaultRow, addNewButtonText, editFormProportion, headerEndContent, }: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=page-with-form-template.d.ts.map