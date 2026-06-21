'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DefaultSecureLayout from '../../components/core/admin/default-secure-layout';
import UserConfirmation from '../../components/core/common/UserConfirmation';
import ErrorBoundary from '../../components/core/common/ErrorBoundary';
import { useEffect } from 'react';
import { usePathname } from '../../components/core/hooks/usePathname';
import { useRouter } from '../../components/core/hooks/useRouter';
import { useSearchParams } from '../../components/core/hooks/useSearchParams';
export default function ClientRootLayout({ children, session, hideSidebar, }) {
    if (!session) {
        return _jsx(ClientRedirect, {});
    }
    return (_jsx(ErrorBoundary, { children: _jsxs(DefaultSecureLayout, { session: session, hideSidebar: hideSidebar, children: [_jsx(ErrorBoundary, { children: children }), _jsx(UserConfirmation, {})] }) }));
}
function ClientRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams().toString();
    useEffect(() => {
        const sourceUrl = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
        const redirectUrl = new URL('/login', window.location.origin);
        redirectUrl.searchParams.set('sourceUrl', sourceUrl);
        router.push(redirectUrl.toString());
    }, [router, pathname, searchParams]);
    return null;
}
//# sourceMappingURL=client-root-layout-dynamic.js.map