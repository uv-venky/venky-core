'use client';

import PageShell from '@/components/core/page/page-shell';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { proxy, useSnapshot } from 'valtio';
import { useManualReadySignal } from '@/lib/core/client/loading-tracker';
import { useEffect } from 'react';

const showThemeCustomizationState = proxy({
  show: false,
});

export function useShowThemeCustomization() {
  const snapshot = useSnapshot(showThemeCustomizationState);
  return snapshot.show;
}

export function ThemesPage() {
  const signalReady = useManualReadySignal();
  useEffect(() => {
    signalReady();
  }, [signalReady]);
  const show = useShowThemeCustomization();
  return (
    <PageShell title="Themes" noPadding mustBeTabletOrDesktop={false}>
      <div className="use flex h-full items-center justify-center gap-4">
        <Switch
          className="cursor-pointer"
          checked={show}
          onCheckedChange={() => {
            showThemeCustomizationState.show = !show;
          }}
        />
        <Label htmlFor="ts" className="cursor-pointer">
          Show Theme Customization
        </Label>
      </div>
    </PageShell>
  );
}
