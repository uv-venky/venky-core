import { jsx as _jsx } from "react/jsx-runtime";
import { redirect } from '../../lib/core/server/redirect';
import { LoginPageContent } from './page-content';
import { auth } from '../../auth';
import { APP_NAME } from '../../lib/common/ui-constants';
export const metadata = {
    title: `Sign In | ${APP_NAME}`,
    description: `Sign in to your ${APP_NAME} account`,
};
export default async function LoginPage({ searchParams }) {
    const session = await auth(true);
    const resolvedSearchParams = await searchParams;
    const sourceUrl = resolvedSearchParams.sourceUrl ?? '/';
    if (session) {
        redirect(sourceUrl);
        return null;
    }
    if (process.env.CLOUDIO_LOGIN_URL) {
        redirect(process.env.CLOUDIO_LOGIN_URL);
        return null;
    }
    return _jsx(LoginPageContent, {});
}
//# sourceMappingURL=page.js.map