'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useId } from 'react';
import { ThemeSettings } from './theme-settings';
import type { Position } from '@/lib/core/common/types/UserSettings';
import { useClientSessionSnapshot, userSessionState } from '@/components/core/hooks';
import { showSuccess } from '@/components/core/common';
import { ComboboxInput } from '@/components/core/page';

export function PreferencesForm() {
  const dateFormatId = useId();
  const timeFormatId = useId();
  const locationId = useId();
  const { settings } = useClientSessionSnapshot();

  return (
    <>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your date, time, and display preferences.</CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={dateFormatId}>Date Format</Label>
            <Select
              value={settings.dateFormat ?? 'MM/DD/YYYY'}
              onValueChange={(value) => {
                userSessionState.session.settings.dateFormat = value;
              }}
            >
              <SelectTrigger id={dateFormatId}>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="MMM D, YYYY">MMM D, YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={timeFormatId}>Time Format</Label>
            <Select
              value={settings?.timeFormat ?? '12h'}
              onValueChange={(value) => {
                userSessionState.session.settings.timeFormat = value;
              }}
            >
              <SelectTrigger id={timeFormatId}>
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (1:30 PM)</SelectItem>
                <SelectItem value="24h">24-hour (13:30)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ComboboxInput
            label="Timezone"
            value={settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
            options={Intl.supportedValuesOf('timeZone').map((timezone) => ({
              label: timezone,
              value: timezone,
            }))}
            getLabel={(timezone) => timezone.label}
            getValue={(timezone) => timezone.value}
            onSelect={(value) => {
              userSessionState.session.settings.timezone = value;
            }}
            labelOnTop
            required
          />
          <div className="space-y-2">
            <Label htmlFor={locationId}>Sonnar Message Location</Label>
            <Select
              value={settings?.notificationLocation ?? 'bottom-right'}
              onValueChange={(value) => {
                userSessionState.session.settings.notificationLocation = value as Position;
                showSuccess('Location updated');
              }}
            >
              <SelectTrigger id={locationId}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <ThemeSettings />
        </div>
      </CardContent>
    </>
  );
}
