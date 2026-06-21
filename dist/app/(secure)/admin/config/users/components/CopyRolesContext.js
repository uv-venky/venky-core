/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { createContext, useContext, useState } from 'react';
const CopyRolesContext = createContext(null);
export function CopyRolesProvider({ children }) {
  const [copyRolesFromUser, setCopyRolesFromUser] = useState();
  return _jsx(CopyRolesContext.Provider, { value: { copyRolesFromUser, setCopyRolesFromUser }, children: children });
}
export function useCopyRolesContext() {
  const context = useContext(CopyRolesContext);
  if (!context) {
    throw new Error('useCopyRolesContext must be used within CopyRolesProvider');
  }
  return context;
}
//# sourceMappingURL=CopyRolesContext.js.map
