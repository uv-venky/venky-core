'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { createContext, useContext } from 'react';
const EnvContext = createContext({
  APP_ID: 'APP_ID_NOT_SET',
});
export function useEnv() {
  return useContext(EnvContext);
}
export function EnvProvider({ children, env }) {
  return _jsx(EnvContext.Provider, { value: env, children: children });
}
//# sourceMappingURL=EnvProvider.js.map
