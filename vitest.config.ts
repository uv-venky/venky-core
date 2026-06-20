import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // `.claude/worktrees` holds Claude Code's isolated git worktrees, each with its own
    // `node_modules` — exclude it so vitest doesn't collect tests from those nested deps.
    exclude: ['node_modules', 'dist', 'build', 'public', 'e2e', '.next', '**/.claude/**'],
    setupFiles: [`${__dirname}/src/test/setup.ts`],
  },
  resolve: {
    alias: {
      'server-only': resolve(__dirname, 'src/test/mocks/server-only.ts'),
    },
  },
});
