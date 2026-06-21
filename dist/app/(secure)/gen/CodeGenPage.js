'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import PageShell from '../../../components/core/page/page-shell';
import PageContent, {} from './page-content';
export function CodeGenPage(props) {
  return _jsx(PageShell, {
    title: 'Code Generator',
    children:
      process.env.NODE_ENV === 'development'
        ? _jsx(PageContent, { ...props })
        : _jsx('div', {
            className: 'flex h-full w-full items-center justify-center',
            children: _jsx('div', {
              className: 'font-bold text-2xl',
              children: 'Code Generator Page is only available in development mode',
            }),
          }),
  });
}
//# sourceMappingURL=CodeGenPage.js.map
