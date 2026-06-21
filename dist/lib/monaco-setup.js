import { loader } from '@monaco-editor/react';
// Configure @monaco-editor/react to use the local monaco-editor package
// instead of loading from CDN (which may serve an older version)
// Only run on client to avoid SSR issues with monaco-editor accessing window
if (typeof window !== 'undefined') {
  import('monaco-editor').then((monaco) => {
    loader.config({ monaco });
  });
}
//# sourceMappingURL=monaco-setup.js.map
