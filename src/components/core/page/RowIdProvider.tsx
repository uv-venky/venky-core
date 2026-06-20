/* Copyright (c) 2024-present VENKY Corp. */

import type { Store, TreeData, TreeStore } from '@/lib/core/common/types/Store';
import type * as React from 'react';
import { createContext, useContext } from 'react';

const RowIdContext = createContext<string | undefined>(undefined);

export function useRowId(): string | undefined {
  return useContext(RowIdContext);
}

export function RowIdProvider({ children, rowId }: { children: React.ReactNode; rowId: string }) {
  return <RowIdContext.Provider value={rowId}>{children}</RowIdContext.Provider>;
}

const StoreContext = createContext<Store<any> | undefined>(undefined);

export function useCurrentStore<T extends object>(): Store<T> | undefined {
  return useContext(StoreContext);
}

export function useCurrentTreeStore<T extends TreeData>(): TreeStore<T> | undefined {
  return useContext(StoreContext) as TreeStore<T> | undefined;
}

export function StoreProvider<T extends object>({ children, store }: { children: React.ReactNode; store: Store<T> }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
