import { jsx as _jsx } from "react/jsx-runtime";
import { UsersPage } from './UsersPage';
import { APP_NAME } from '../../../../../lib/common/ui-constants';
export const metadata = {
    title: `Users | Admin | ${APP_NAME}`,
    description: `Manage user accounts and permissions for ${APP_NAME}`,
};
export default function Page() {
    return _jsx(UsersPage, {});
}
//# sourceMappingURL=page.js.map