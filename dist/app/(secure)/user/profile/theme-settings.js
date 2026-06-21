'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import useTheme from '../../../../components/core/hooks/useTheme';
import { Label } from '../../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { useId } from 'react';
export function ThemeSettings() {
  const { setTheme, theme } = useTheme();
  const lightId = useId();
  const darkId = useId();
  const systemId = useId();
  return _jsxs('div', {
    children: [
      _jsx('h3', { className: 'mb-3 font-medium text-lg', children: 'Theme Preference' }),
      _jsxs(RadioGroup, {
        value: theme ?? 'system',
        className: 'flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0',
        onValueChange: async (theme) => {
          setTheme(theme);
        },
        children: [
          _jsxs('div', {
            className: 'flex items-center space-x-2',
            children: [
              _jsx(RadioGroupItem, { value: 'light', id: lightId }),
              _jsx(Label, { htmlFor: lightId, children: 'Light' }),
            ],
          }),
          _jsxs('div', {
            className: 'flex items-center space-x-2',
            children: [
              _jsx(RadioGroupItem, { value: 'dark', id: darkId }),
              _jsx(Label, { htmlFor: darkId, children: 'Dark' }),
            ],
          }),
          _jsxs('div', {
            className: 'flex items-center space-x-2',
            children: [
              _jsx(RadioGroupItem, { value: 'system', id: systemId }),
              _jsx(Label, { htmlFor: systemId, children: 'System' }),
            ],
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=theme-settings.js.map
