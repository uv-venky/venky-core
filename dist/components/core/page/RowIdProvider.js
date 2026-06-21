import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const RowIdContext = createContext(undefined);
export function useRowId() {
    return useContext(RowIdContext);
}
export function RowIdProvider({ children, rowId }) {
    return _jsx(RowIdContext.Provider, { value: rowId, children: children });
}
const StoreContext = createContext(undefined);
export function useCurrentStore() {
    return useContext(StoreContext);
}
export function useCurrentTreeStore() {
    return useContext(StoreContext);
}
export function StoreProvider({ children, store }) {
    return _jsx(StoreContext.Provider, { value: store, children: children });
}
//# sourceMappingURL=RowIdProvider.js.map