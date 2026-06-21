/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import PageShell from '../../../../../components/core/page/page-shell';
import PageContent from './page-content';
export function UsersPage(props) {
  return _jsx(PageShell, {
    title: 'Users',
    noPadding: true,
    mustBeTabletOrDesktop: false,
    children: _jsx(PageContent, { ...props }),
  });
}
//# sourceMappingURL=UsersPage.js.map
