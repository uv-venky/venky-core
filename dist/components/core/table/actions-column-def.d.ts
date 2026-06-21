import type { TableAction, TableActionRenderFnProps, TableActionOpenDialogFn, TableActionRenderFn, TableActionWithLabel, TableActionWithRender } from '../../../components/core/table/actions-column';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
export declare const ACTIONS_COLUMN_ID = "__actions";
export type { TableAction, TableActionOpenDialogFn, TableActionRenderFn, TableActionRenderFnProps, TableActionWithLabel, TableActionWithRender, };
export declare function createActionsColumn<T extends object>(actions: TableAction[], options?: {
    size?: number;
    title?: string;
}): AccessorKeyColumnDef<T>;
//# sourceMappingURL=actions-column-def.d.ts.map