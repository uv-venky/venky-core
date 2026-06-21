import { type ReactNode } from 'react';
interface SidebarVisibilityContextValue {
    registerHideRequest: () => () => void;
    shouldHideSidebar: boolean;
}
export declare function SidebarVisibilityProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useSidebarVisibility(): SidebarVisibilityContextValue;
/**
 * Hook to hide the sidebar completely when the component mounts and restore it on unmount.
 * If the sidebar was already hidden when the component mounted, it will remain hidden on unmount.
 */
export declare function useHideSidebar(): void;
export {};
//# sourceMappingURL=sidebar-visibility-context.d.ts.map