'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../../lib/utils';
import { VenkyLogo } from '../../logo';
import { getLoginPageBackgroundClass, getLoginPageBackgroundStyle } from '../../login-page-background';
import { NewPasswordForm } from '../../../../components/new-password-form';
import { isValidPasswordResetToken } from '../actions';
import { Alert, AlertTitle } from '../../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from '../../../../components/core/link';
import { useEffect, useState } from 'react';
import { getErrorMessage, isErrorResponse } from '../../../../lib/core/common/error';
import { showError } from '../../../../components/core/common/Notification';
export function ResetPasswordPageContent({ token, logo: LogoComponent = VenkyLogo, backgroundImageUrl, backgroundClassName, className, }) {
    const [isValid, setIsValid] = useState(null);
    useEffect(() => {
        async function checkIsValid() {
            const result = await isValidPasswordResetToken(token);
            if (isErrorResponse(result)) {
                showError(result.message);
                setIsValid(false);
            }
            else {
                setIsValid(result);
            }
        }
        checkIsValid().catch((error) => {
            showError(getErrorMessage(error));
            setIsValid(false);
        });
    }, [token]);
    if (isValid === null) {
        return _jsx("div", { children: "Loading..." });
    }
    return (_jsxs("div", { className: cn('flex h-screen flex-col overflow-hidden', getLoginPageBackgroundClass(backgroundImageUrl, backgroundClassName), className), style: getLoginPageBackgroundStyle(backgroundImageUrl), children: [_jsx("header", { className: "shrink-0 bg-transparent px-6 py-3", children: _jsx("div", { className: "mx-auto flex max-w-7xl items-center justify-between", children: _jsx("div", { className: "flex items-center gap-4", children: _jsx(LogoComponent, {}) }) }) }), _jsx("main", { className: "flex flex-1 items-center justify-center p-6", children: isValid ? (_jsx(NewPasswordForm, { token: token })) : (_jsxs(Alert, { variant: "destructive", className: "max-w-sm", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertTitle, { className: "flex items-center justify-between gap-2", children: ["Link expired or invalid!", _jsx(Link, { prefetch: false, href: "/login/reset-password", className: "text-primary text-sm hover:underline", children: "Request a new link" })] })] })) })] }));
}
//# sourceMappingURL=page-content.js.map