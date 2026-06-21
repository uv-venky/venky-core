'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../lib/utils';
import { VenkyLogo } from '../logo';
import { getLoginPageBackgroundClass, getLoginPageBackgroundStyle } from '../login-page-background';
import { ResetPasswordForm } from '../../../components/reset-password-form';
export function ResetPasswordPageContent({ logo: LogoComponent = VenkyLogo, backgroundImageUrl, backgroundClassName, className, } = {}) {
    return (_jsxs("div", { className: cn('flex h-screen flex-col overflow-hidden', getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName), className), style: getLoginPageBackgroundStyle(backgroundImageUrl), children: [_jsx("header", { className: "shrink-0 bg-transparent px-6 py-3", children: _jsx("div", { className: "mx-auto flex max-w-7xl items-center justify-between", children: _jsx("div", { className: "flex items-center gap-4", children: _jsx(LogoComponent, {}) }) }) }), _jsx("main", { className: "flex flex-1 items-center justify-center p-6", children: _jsx(ResetPasswordForm, {}) })] }));
}
//# sourceMappingURL=page-content.js.map