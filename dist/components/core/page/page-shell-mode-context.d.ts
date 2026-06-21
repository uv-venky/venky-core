import { type ReactNode } from 'react';
export type PageShellMode = 'standalone' | 'embedded';
interface PageShellModeContextValue {
    mode: PageShellMode;
}
/** When `mode="embedded"`, nested `PageShell` instances hide their header chrome. */
export declare function PageShellModeProvider({ mode, children }: {
    mode: PageShellMode;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function usePageShellModeSafe(): PageShellModeContextValue | null;
export {};
//# sourceMappingURL=page-shell-mode-context.d.ts.map