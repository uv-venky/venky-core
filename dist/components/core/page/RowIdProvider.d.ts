import type { Store, TreeData, TreeStore } from '../../../lib/core/common/types/Store';
import type * as React from 'react';
export declare function useRowId(): string | undefined;
export declare function RowIdProvider({ children, rowId }: {
    children: React.ReactNode;
    rowId: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function useCurrentStore<T extends object>(): Store<T> | undefined;
export declare function useCurrentTreeStore<T extends TreeData>(): TreeStore<T> | undefined;
export declare function StoreProvider<T extends object>({ children, store }: {
    children: React.ReactNode;
    store: Store<T>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=RowIdProvider.d.ts.map