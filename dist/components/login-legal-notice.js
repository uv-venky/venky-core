import { Fragment as _Fragment, jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from '../components/core/link';
export function LoginLegalNotice({ notice }) {
    const { prefix, termsLink, conjunction = 'and', privacyLink } = notice;
    if (!termsLink && !privacyLink) {
        return null;
    }
    return (_jsxs("p", { className: "mb-4 text-white/50 text-xs", children: [prefix ? _jsxs(_Fragment, { children: [prefix, " "] }) : null, termsLink ? (_jsx(Link, { prefetch: false, href: termsLink.href, children: _jsx("u", { className: "cursor-pointer", children: termsLink.label }) })) : null, termsLink && privacyLink ? _jsxs(_Fragment, { children: [" ", conjunction, " "] }) : null, privacyLink ? (_jsx(Link, { prefetch: false, href: privacyLink.href, children: _jsx("u", { className: "cursor-pointer", children: privacyLink.label }) })) : null] }));
}
//# sourceMappingURL=login-legal-notice.js.map