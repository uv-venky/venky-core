'use client';
import { useEffect } from 'react';
export function ReactScan() {
  useEffect(() => {
    import('react-scan').then((mod) => {
      mod.scan({
        enabled: true,
      });
    });
  }, []);
  return null;
}
//# sourceMappingURL=ReactScan.js.map
