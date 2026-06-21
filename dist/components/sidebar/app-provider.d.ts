import { type ReactNode } from 'react';
import { type AppContextValue } from './app-provider-base';
export { type AppContextValue, useAppContext, type CustomMiniLogoProps, useDeployConfig, useAppSidebarContext, AppContext, } from './app-provider-base';
export interface AppProviderProps extends Partial<AppContextValue> {
    hideSidebar?: boolean;
    children: ReactNode;
}
export declare function AppProvider({ hideSidebar, children, ...props }: AppProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=app-provider.d.ts.map