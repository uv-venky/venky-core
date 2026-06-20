'use client';

import { createContext, useContext, useState } from 'react';

const HeaderStartContentContext = createContext<React.ReactNode>(null);

const SetHeaderStartContentContext = createContext<(node: React.ReactNode) => void>(() => {});

export function HeaderStartContentProvider({ children }: { children: React.ReactNode }) {
  const [headerStartContent, setHeaderStartContent] = useState<React.ReactNode>(null);

  return (
    <HeaderStartContentContext.Provider value={headerStartContent}>
      <SetHeaderStartContentContext.Provider value={setHeaderStartContent}>
        {children}
      </SetHeaderStartContentContext.Provider>
    </HeaderStartContentContext.Provider>
  );
}

export function useHeaderStartContent() {
  return useContext(HeaderStartContentContext);
}

export function useSetHeaderStartContent() {
  return useContext(SetHeaderStartContentContext);
}
