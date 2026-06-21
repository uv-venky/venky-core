import { jsx as _jsx } from "react/jsx-runtime";
import { render } from '@testing-library/react';
import { AppContext } from '../components/sidebar/app-provider';
import { APP_DESCRIPTION as DEFAULT_APP_DESCRIPTION, APP_NAME as DEFAULT_APP_NAME, DISABLE_HEADER_FILTERS_DEFAULT as DEFAULT_DISABLE_HEADER_FILTERS, IGNORE_CASE_DEFAULT as DEFAULT_IGNORE_CASE, ENABLE_NATURAL_LANGUAGE_SEARCH_DEFAULT as DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH, SEARCH_INPUT_MODE_DEFAULT as DEFAULT_SEARCH_INPUT_MODE, TEST_PASSWORD as DEFAULT_TEST_PASSWORD, } from '../lib/common/ui-constants';
/**
 * Minimal AppContext value for tests
 */
const defaultTestAppContext = {
    APP_NAME: DEFAULT_APP_NAME,
    APP_DESCRIPTION: DEFAULT_APP_DESCRIPTION,
    DISABLE_HEADER_FILTERS_DEFAULT: DEFAULT_DISABLE_HEADER_FILTERS,
    DEFAULT_SEARCH_INPUT_MODE,
    DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH,
    IGNORE_CASE_DEFAULT: DEFAULT_IGNORE_CASE,
    TEST_PASSWORD: DEFAULT_TEST_PASSWORD,
    whyDidYouUpdateEnabled: false,
    whyDidYouUpdateNames: [],
    naturalLanguageSearchEnabled: false,
};
/**
 * Test wrapper that provides AppContext without the full AppProvider setup
 * Use this in tests when components require AppContext
 */
export function TestAppProvider({ children, value }) {
    const contextValue = {
        ...defaultTestAppContext,
        ...value,
    };
    return _jsx(AppContext.Provider, { value: contextValue, children: children });
}
/**
 * Custom render function that wraps components with TestAppProvider
 * Use this instead of the default render from @testing-library/react
 */
export function renderWithAppProvider(ui, options) {
    const { appContextValue, ...renderOptions } = options ?? {};
    return render(ui, {
        wrapper: ({ children }) => _jsx(TestAppProvider, { value: appContextValue, children: children }),
        ...renderOptions,
    });
}
//# sourceMappingURL=test-utils.js.map