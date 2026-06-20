'use client';

import useTheme from '@/components/core/hooks/useTheme';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useId } from 'react';

export function ThemeSettings() {
  const { setTheme, theme } = useTheme();
  const lightId = useId();
  const darkId = useId();
  const systemId = useId();
  return (
    <div>
      <h3 className="mb-3 font-medium text-lg">Theme Preference</h3>
      <RadioGroup
        value={theme ?? 'system'}
        className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0"
        onValueChange={async (theme) => {
          setTheme(theme as 'light' | 'dark' | 'system');
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id={lightId} />
          <Label htmlFor={lightId}>Light</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id={darkId} />
          <Label htmlFor={darkId}>Dark</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id={systemId} />
          <Label htmlFor={systemId}>System</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
