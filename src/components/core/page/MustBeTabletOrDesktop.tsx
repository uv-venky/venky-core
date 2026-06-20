'use client';

import useWindowSize from '@/components/core/hooks/useWindowSize';
import { InfoIcon } from 'lucide-react';
import { useManualReadySignal } from '@/lib/core/client/loading-tracker';
import { useEffect } from 'react';

const MIN_WIDTH = 1024;
const MIN_HEIGHT = 600;

export function useIsTabletOrDesktop() {
  const { width, height } = useWindowSize();

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    return false;
  }

  return true;
}

function MustBeTabletOrDesktopContent() {
  const { width, height } = useWindowSize();
  const manualReadySignal = useManualReadySignal();

  useEffect(() => {
    manualReadySignal();
  }, [manualReadySignal]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <div className="text-wrap text-center font-bold text-2xl">
        Please use a desktop or tablet to access this application.
      </div>
      <div className="text-center text-2xl text-muted-foreground">
        Required resolution: {MIN_WIDTH} x {MIN_HEIGHT}
        <br />
        Current resolution: {width} x {height}
        <br />({Math.round((width < MIN_WIDTH ? width / MIN_WIDTH : height / MIN_HEIGHT) * 100)}% of required
        resolution)
      </div>
      {height >= MIN_WIDTH && width >= MIN_HEIGHT && (
        <div className="flex items-center gap-2">
          <InfoIcon className="h-4 w-4" /> You may need to rotate your device.
        </div>
      )}
    </div>
  );
}

export default function MustBeTabletOrDesktop({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isTabletOrDesktop = useIsTabletOrDesktop();

  if (!isTabletOrDesktop) {
    return <MustBeTabletOrDesktopContent />;
  }

  return children;
}
