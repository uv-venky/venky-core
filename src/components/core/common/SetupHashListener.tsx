'use client';

import { hashState } from '@/lib/core/client/state';
import { useEffect, useInsertionEffect } from 'react';
import { usePathname } from '@/components/core/hooks/usePathname';

export function syncHashState() {
  const newHash = window.location.hash.slice(1);
  const currentHash = hashState.hash.current.toString();

  // Only update if hash actually changed
  if (newHash !== currentHash) {
    const newParams = new URLSearchParams(newHash);
    hashState.hash = {
      previous: hashState.hash.current,
      current: newParams,
      pathname: window.location.pathname,
    };
  }
}

export default function SetupHashListener() {
  const pathname = usePathname();

  useInsertionEffect(() => {
    hashState.hash = {
      previous: new URLSearchParams(),
      current: new URLSearchParams(window.location.hash.slice(1)),
      pathname,
    };
  }, [pathname]);

  useEffect(() => {
    syncHashState();
    window.addEventListener('hashchange', syncHashState);
    return () => {
      window.removeEventListener('hashchange', syncHashState);
    };
  }, []);

  return null;
}
