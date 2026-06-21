export default function PageShell({ title, children, headerEndContent, noPadding, hideThemeToggle, hideHeader: hideHeaderProp, mustBeTabletOrDesktop, enableShareUrl, noScroll, sidebarState, sidebarIsMobile, onToggleSidebar, teamName, }: Readonly<{
    title?: string;
    children: React.ReactNode;
    headerEndContent?: React.ReactNode;
    noPadding?: boolean;
    hideThemeToggle?: boolean;
    /** Explicit override; when omitted, defers to `PageShellModeProvider` (`embedded` hides header). */
    hideHeader?: boolean;
    mustBeTabletOrDesktop?: boolean;
    enableShareUrl?: boolean;
    noScroll?: boolean;
    sidebarState?: 'expanded' | 'collapsed';
    sidebarIsMobile?: boolean;
    onToggleSidebar?: () => void;
    teamName?: string;
}>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=page-shell.d.ts.map