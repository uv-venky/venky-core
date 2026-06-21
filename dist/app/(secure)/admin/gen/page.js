'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { CodeGenPage } from '../../gen/CodeGenPage';
const modules = [
  {
    value: 'core',
    label: 'Administration',
  },
];
const subModules = [
  {
    value: 'config',
    label: 'Configuration',
  },
  {
    value: 'monitoring',
    label: 'Monitoring',
  },
];
export default function Page() {
  return _jsx(CodeGenPage, { modules: modules, subModules: subModules });
}
//# sourceMappingURL=page.js.map
