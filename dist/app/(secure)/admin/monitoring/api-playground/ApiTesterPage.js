import { jsx as _jsx } from "react/jsx-runtime";
import { ApiTesterContent } from './page-content';
import { ApiTesterProvider } from './context';
import PageShell from '../../../../../components/core/page/page-shell';
export function ApiTesterPage() {
    return (_jsx(PageShell, { title: "API Playground", noPadding: true, enableShareUrl: true, children: _jsx(ApiTesterProvider, { children: _jsx(ApiTesterContent, {}) }) }));
}
//# sourceMappingURL=ApiTesterPage.js.map