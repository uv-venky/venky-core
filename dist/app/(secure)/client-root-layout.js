'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { lazy } from 'react';
const ClientRootLayoutDynamic = lazy(() => import('./client-root-layout-dynamic'));
export default function ClientRootLayout({ children, session, hideSidebar }) {
  return _jsx(ClientRootLayoutDynamic, { session: session, hideSidebar: hideSidebar, children: children });
}
//# sourceMappingURL=client-root-layout.js.map
