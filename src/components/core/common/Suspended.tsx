'use client';

import { useEffect } from 'react';
import { WaveDots } from '@/components/core/common/WaveDots';
import clientLogger from '@/lib/core/client/client-logger';

const debug = false;

export default function Suspended({ name }: { name: string }) {
  if (debug && clientLogger.isDebugEnabled) {
    clientLogger.debug({ message: 'Suspended.render', name });
  }
  useEffect(() => {
    if (!debug || !clientLogger.isDebugEnabled) {
      return;
    }
    clientLogger.debug({ message: 'Suspended.mount', name });
    return () => {
      clientLogger.debug({ message: 'Suspended.unmount', name });
    };
  }, [name]);

  return <WaveDots active reason={name} />;
}
