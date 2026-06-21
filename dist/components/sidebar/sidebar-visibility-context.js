'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useCallback, useState } from 'react';
const SidebarVisibilityContext = createContext(undefined);
export function SidebarVisibilityProvider({ children }) {
    const [shouldHideSidebar, setShouldHideSidebar] = useState(false);
    const registerHideRequest = useCallback(() => {
        setShouldHideSidebar(true);
        return () => {
            setShouldHideSidebar(false);
        };
    }, []);
    return (_jsx(SidebarVisibilityContext.Provider, { value: { registerHideRequest, shouldHideSidebar }, children: children }));
}
export function useSidebarVisibility() {
    const context = useContext(SidebarVisibilityContext);
    if (!context) {
        throw new Error('useSidebarVisibility must be used within a SidebarVisibilityProvider');
    }
    return context;
}
/**
 * Hook to hide the sidebar completely when the component mounts and restore it on unmount.
 * If the sidebar was already hidden when the component mounted, it will remain hidden on unmount.
 */
export function useHideSidebar() {
    const { registerHideRequest } = useSidebarVisibility();
    useEffect(() => {
        const cleanup = registerHideRequest();
        return cleanup;
    }, [registerHideRequest]);
}
//# sourceMappingURL=sidebar-visibility-context.js.map