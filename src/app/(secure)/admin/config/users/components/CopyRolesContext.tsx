/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

const CopyRolesContext = createContext<{
  copyRolesFromUser: string | undefined;
  setCopyRolesFromUser: (userName: string | undefined) => void;
} | null>(null);

export function CopyRolesProvider({ children }: { children: ReactNode }) {
  const [copyRolesFromUser, setCopyRolesFromUser] = useState<string | undefined>();

  return (
    <CopyRolesContext.Provider value={{ copyRolesFromUser, setCopyRolesFromUser }}>
      {children}
    </CopyRolesContext.Provider>
  );
}

export function useCopyRolesContext() {
  const context = useContext(CopyRolesContext);
  if (!context) {
    throw new Error('useCopyRolesContext must be used within CopyRolesProvider');
  }
  return context;
}
