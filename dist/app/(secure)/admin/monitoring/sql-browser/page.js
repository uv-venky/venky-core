import { jsx as _jsx } from "react/jsx-runtime";
import { auth } from '../../../../../auth';
import { APP_NAME } from '../../../../../lib/common/ui-constants';
import { SQLBrowserPage } from './SQLBrowserPage';
import { redirect } from '../../../../../lib/core/server/redirect';
export const metadata = {
    title: `SQL Browser | Admin | ${APP_NAME}`,
    description: `Execute and explore SQL queries for ${APP_NAME}`,
};
export default async function Page() {
    const session = await auth(true);
    if (!session) {
        redirect('/login');
    }
    const isAdmin = session.user.roles.includes('admin');
    if (!isAdmin) {
        redirect('/access-denied?message=Access restricted to admins.');
    }
    return _jsx(SQLBrowserPage, {});
}
//# sourceMappingURL=page.js.map