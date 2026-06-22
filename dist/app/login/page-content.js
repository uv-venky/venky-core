'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useSearchParams } from '../../components/core/hooks/useSearchParams';
import { LoginForm } from '../../components/login-form';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';
import { VenkyLogo } from './logo';
import { getLoginPageBackgroundClass, getLoginPageBackgroundStyle } from './login-page-background';
import { DEFAULT_LOGIN_TABS, } from './login-page-types';
import { SSOButton } from './signin-button';
import { GoogleSignInButton } from './google-signin-button';
const isGoogleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';
function SsoLoginPanel({ tab }) {
    return (_jsxs(Card, { className: "border-none bg-login-card text-login-foreground backdrop-blur-md", children: [_jsxs(CardContent, { className: "flex min-h-[300px] flex-col items-center justify-center space-y-4", children: [_jsx("span", { "data-slot": "card-title", className: "font-semibold leading-none", children: tab.ssoTitle ?? 'SSO Login' }), tab.ssoDescription ? (_jsx("span", { "data-slot": "card-description", className: "text-muted-foreground text-sm", children: tab.ssoDescription })) : null] }), _jsxs(CardFooter, { className: "flex flex-col gap-3", children: [_jsx(SSOButton, {}), isGoogleOAuthEnabled && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex w-full items-center gap-3", children: [_jsx("div", { className: "h-px flex-1 bg-login-muted/40" }), _jsx("span", { className: "text-login-muted text-xs", children: "or" }), _jsx("div", { className: "h-px flex-1 bg-login-muted/40" })] }), _jsx(GoogleSignInButton, {})] }))] })] }));
}
function renderLoginTabContent(tab, legalNotice) {
    if (tab.type === 'sso') {
        return _jsx(SsoLoginPanel, { tab: tab });
    }
    return _jsx(LoginForm, { legalNotice: legalNotice });
}
const TAB_GRID_CLASS = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
};
function LoginTabs({ tabs, legalNotice }) {
    const defaultTab = tabs[0]?.id ?? 'client';
    if (tabs.length === 1) {
        return _jsx("div", { className: "pt-0", children: renderLoginTabContent(tabs[0], legalNotice) });
    }
    return (_jsxs(Tabs, { defaultValue: defaultTab, className: "w-full", children: [_jsx(TabsList, { className: cn('grid w-full rounded-full bg-login-input-bg/80 p-1', TAB_GRID_CLASS[tabs.length] ?? 'grid-cols-2'), children: tabs.map((tab) => (_jsx(TabsTrigger, { value: tab.id, className: "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", children: tab.label }, tab.id))) }), tabs.map((tab) => (_jsx(TabsContent, { value: tab.id, className: "pt-6", children: renderLoginTabContent(tab, legalNotice) }, tab.id)))] }));
}
export function LoginPageContent({ logo: LogoComponent = VenkyLogo, backgroundImageUrl, backgroundClassName, className, tabs = DEFAULT_LOGIN_TABS, legalNotice, } = {}) {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');
    const loginTabs = tabs.length > 0 ? tabs : DEFAULT_LOGIN_TABS;
    return (_jsxs("div", { className: cn('flex h-screen flex-col overflow-hidden', getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName), className), style: getLoginPageBackgroundStyle(backgroundImageUrl), children: [_jsx("header", { className: "shrink-0 px-8 py-6", children: _jsx("div", { className: "flex items-center", children: _jsx(LogoComponent, {}) }) }), _jsx("main", { className: "flex flex-1 items-center justify-end pr-24", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "flex flex-col self-center rounded-2xl bg-login-card/80 p-8 shadow-lg backdrop-blur-md", children: [errorMessage && (_jsx("div", { className: "mb-4 rounded-md bg-destructive/20 p-3 text-center text-destructive text-sm", children: errorMessage })), _jsx(LoginTabs, { tabs: loginTabs, legalNotice: legalNotice })] }) }) })] }));
}
//# sourceMappingURL=page-content.js.map