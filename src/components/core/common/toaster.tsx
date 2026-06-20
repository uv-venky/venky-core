'use client';

import { Toaster } from '@/components/ui/sonner';
import { useClientSessionSnapshot } from '@/components/core/hooks/useClientSessionSnapshot';

export default function ToasterComponent() {
  const { settings } = useClientSessionSnapshot();

  return (
    <Toaster
      richColors
      closeButton
      position={settings.notificationLocation ?? 'bottom-right'}
      className="pointer-events-auto"
    />
  );
}
