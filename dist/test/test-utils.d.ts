import type { ReactNode } from 'react';
import { type RenderOptions, type RenderResult } from '@testing-library/react';
import { type AppContextValue } from '../components/sidebar/app-provider';
/**
 * Test wrapper that provides AppContext without the full AppProvider setup
 * Use this in tests when components require AppContext
 */
export declare function TestAppProvider({ children, value }: {
    children: ReactNode;
    value?: Partial<AppContextValue>;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Custom render function that wraps components with TestAppProvider
 * Use this instead of the default render from @testing-library/react
 */
export declare function renderWithAppProvider(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'> & {
    appContextValue?: Partial<AppContextValue>;
}): RenderResult;
//# sourceMappingURL=test-utils.d.ts.map