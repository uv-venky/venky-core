'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useActionState, useEffect, useState } from 'react';
import { changePassword } from '../app/login/reset-password/actions';
import { toast } from 'sonner';
import { ArrowRight, CheckIcon } from 'lucide-react';
import { Link } from '../components/core/link';
import { getPasswordRequirements } from '../lib/common/password-utils';
import { PasswordInput } from './core/page/fields';
import { loginButtonStyles, loginFieldStyles } from './login-form';
export function NewPasswordForm({ token }) {
    const [state, formAction] = useActionState(changePassword, undefined);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const requirements = getPasswordRequirements();
    requirements.push({
        label: 'Password matches',
        test: (pwd) => pwd.length > 0 && pwd === confirmPassword,
        message: 'Passwords do not match',
    });
    // Helper to check if all requirements are met
    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const isPasswordValid = requirements.every((req) => req.test(password));
    const isFormValid = isPasswordValid && passwordsMatch;
    useEffect(() => {
        if (state) {
            if (state.status === 'OK') {
                toast.success('Password changed');
            }
            else {
                toast.error(state.message);
            }
        }
    }, [state]);
    if (state && state.status === 'OK') {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Password changed" }) }), _jsxs(CardContent, { className: "flex flex-col space-y-4", children: [_jsx("span", { children: "Your password has been changed successfully." }), _jsxs(Link, { prefetch: false, href: "/login", className: "item-center flex text-primary text-sm hover:underline", children: ["Login ", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })] })] }));
    }
    return (_jsx("main", { className: "flex flex-1 items-center justify-end pr-24", children: _jsx("form", { action: formAction, className: "w-full max-w-sm", children: _jsxs(Card, { className: "border-none bg-login-card text-login-foreground backdrop-blur-md", children: [_jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "mb-8 flex items-center justify-center", children: _jsx("span", { className: "mx-auto font-title-light text-3xl", children: "Change your password" }) }), _jsx(PasswordInput, { value: password, onChange: (value) => setPassword(value ?? ''), labelOnTop: true, autoFocus: true, autoComplete: "new-password", placeholder: "New Password", name: "password", inputClassName: loginFieldStyles }), _jsx(PasswordInput, { value: confirmPassword, onChange: (value) => setConfirmPassword(value ?? ''), placeholder: "Confirm Password", labelOnTop: true, autoComplete: "new-password", name: "confirmPassword", inputClassName: loginFieldStyles }), _jsx("ul", { className: "mt-1 space-y-1 text-sm", children: requirements.map((req) => {
                                    const passed = req.test(password);
                                    return (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: `flex size-4 items-center justify-center rounded-full border ${passed ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground bg-muted text-muted-foreground'}`, children: passed && _jsx(CheckIcon, { className: "size-3" }) }), _jsx("span", { className: passed ? 'text-green-600' : 'text-muted-foreground', children: req.label })] }, req.label));
                                }) }), _jsx("input", { type: "hidden", name: "token", value: token })] }), _jsx(CardFooter, { children: _jsx(Button, { type: "submit", className: loginButtonStyles, disabled: !isFormValid, children: "Change Password" }) })] }) }) }));
}
//# sourceMappingURL=new-password-form.js.map