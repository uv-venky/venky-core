'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const HeaderStartContentContext = createContext(null);
const SetHeaderStartContentContext = createContext(() => { });
export function HeaderStartContentProvider({ children }) {
    const [headerStartContent, setHeaderStartContent] = useState(null);
    return (_jsx(HeaderStartContentContext.Provider, { value: headerStartContent, children: _jsx(SetHeaderStartContentContext.Provider, { value: setHeaderStartContent, children: children }) }));
}
export function useHeaderStartContent() {
    return useContext(HeaderStartContentContext);
}
export function useSetHeaderStartContent() {
    return useContext(SetHeaderStartContentContext);
}
//# sourceMappingURL=page-shell-header-context.js.map