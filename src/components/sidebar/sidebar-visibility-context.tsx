'use client';

import { createContext, useContext, useEffect, useCallback, useState, type ReactNode } from 'react';

interface SidebarVisibilityContextValue {
  registerHideRequest: () => () => void;
  shouldHideSidebar: boolean;
}

const SidebarVisibilityContext = createContext<SidebarVisibilityContextValue | undefined>(undefined);

export function SidebarVisibilityProvider({ children }: { children: ReactNode }) {
  const [shouldHideSidebar, setShouldHideSidebar] = useState(false);

  const registerHideRequest = useCallback(() => {
    setShouldHideSidebar(true);
    return () => {
      setShouldHideSidebar(false);
    };
  }, []);

  return (
    <SidebarVisibilityContext.Provider value={{ registerHideRequest, shouldHideSidebar }}>
      {children}
    </SidebarVisibilityContext.Provider>
  );
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
