/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type PageShellMode = 'standalone' | 'embedded';

interface PageShellModeContextValue {
  mode: PageShellMode;
}

const PageShellModeContext = createContext<PageShellModeContextValue | null>(null);

/** When `mode="embedded"`, nested `PageShell` instances hide their header chrome. */
export function PageShellModeProvider({ mode, children }: { mode: PageShellMode; children: ReactNode }) {
  return <PageShellModeContext.Provider value={{ mode }}>{children}</PageShellModeContext.Provider>;
}

export function usePageShellModeSafe(): PageShellModeContextValue | null {
  return useContext(PageShellModeContext);
}
