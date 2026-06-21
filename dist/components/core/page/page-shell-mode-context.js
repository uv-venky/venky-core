/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const PageShellModeContext = createContext(null);
/** When `mode="embedded"`, nested `PageShell` instances hide their header chrome. */
export function PageShellModeProvider({ mode, children }) {
    return _jsx(PageShellModeContext.Provider, { value: { mode }, children: children });
}
export function usePageShellModeSafe() {
    return useContext(PageShellModeContext);
}
//# sourceMappingURL=page-shell-mode-context.js.map