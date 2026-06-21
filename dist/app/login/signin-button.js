'use client'; // Only this component is client-side
import { jsx as _jsx } from "react/jsx-runtime";
import { useRouter } from '../../components/core/hooks/useRouter';
import { useSearchParams } from '../../components/core/hooks/useSearchParams';
import { Button } from '../../components/ui/button';
import { loginButtonStyles } from '../../components/login-form';
export function SSOButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sourceUrl = searchParams.get('sourceUrl') ?? '/';
    return (_jsx("div", { className: "w-full", children: _jsx(Button, { activityId: "login-sso-signin", className: loginButtonStyles, onClick: () => router.push(`/api/auth/sso?RelayState=${sourceUrl}`), children: "Sign In" }) }));
}
//# sourceMappingURL=signin-button.js.map