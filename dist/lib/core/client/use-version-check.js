'use client';
/* Copyright (c) 2024-present Venky Corp. */
import { useState } from 'react';
import { APP_VERSION } from '../../../lib/app-info';
import { useSSE } from '../../../lib/sse/client/use-sse';
/**
 * Hook to detect when a new version of the app has been deployed
 *
 * Uses SSE to listen for version updates from the server. When the server
 * sends a version message that differs from the client version, it means
 * a new version has been deployed.
 *
 * @returns Object with `hasNewVersion` boolean and `currentVersion` string
 */
export function useVersionCheck() {
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [serverVersion, setServerVersion] = useState(null);
  const clientVersion = APP_VERSION;
  // Subscribe to system channel to receive version updates
  useSSE({
    channels: ['_system'],
    onMessage: (_channel, data) => {
      const payload = data;
      // Handle version messages
      if (payload.type === 'version' && payload.version) {
        const receivedVersion = payload.version;
        setServerVersion(receivedVersion);
        // Compare with client version
        if (receivedVersion !== clientVersion) {
          setHasNewVersion(true);
        } else {
          // Versions match, clear any previous new version state
          setHasNewVersion(false);
        }
      }
    },
  });
  return {
    hasNewVersion,
    clientVersion,
    serverVersion,
  };
}
//# sourceMappingURL=use-version-check.js.map
