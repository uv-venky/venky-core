'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { AppProvider } from '../../components/sidebar/app-provider';
import { APP_NAME, APP_DESCRIPTION, DISABLE_HEADER_FILTERS_DEFAULT, IGNORE_CASE_DEFAULT, TEST_PASSWORD, } from '../../lib/common/ui-constants';
import { deployConfig, AWS_REGION, GITHUB_REPO_NAME } from '../../lib/config/deploy-config';
import { cn } from '../../lib/utils';
const CustomMiniLogo = ({ className, fill = '#512eff' }) => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", "aria-hidden": "true", className: cn(className, 'size-6 shrink-0'), children: _jsx("text", { x: "12", y: "16.8", textAnchor: "middle", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial", fontSize: "14.5", fontWeight: "700", fill: fill, children: "W" }) }));
export default function RootLayout({ children, }) {
    return (_jsx(AppProvider, { APP_NAME: APP_NAME, APP_DESCRIPTION: APP_DESCRIPTION, DISABLE_HEADER_FILTERS_DEFAULT: DISABLE_HEADER_FILTERS_DEFAULT, IGNORE_CASE_DEFAULT: IGNORE_CASE_DEFAULT, TEST_PASSWORD: TEST_PASSWORD, deployConfig: deployConfig, awsRegion: AWS_REGION, gitHubRepoName: GITHUB_REPO_NAME, customMiniLogo: CustomMiniLogo, naturalLanguageSearchEnabled: false, children: children }));
}
//# sourceMappingURL=layout.js.map