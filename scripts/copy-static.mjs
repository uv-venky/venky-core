import { mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const DIST_DIR = path.resolve(__dirname, '../dist');

const assetGlobs = ['**/*.css'];

function copyAssets() {
  for (const pattern of assetGlobs) {
    const matches = globSync(pattern, { cwd: SRC_DIR, nodir: true });
    for (const relativeFile of matches) {
      const from = path.join(SRC_DIR, relativeFile);
      const to = path.join(DIST_DIR, relativeFile);
      mkdirSync(path.dirname(to), { recursive: true });
      copyFileSync(from, to);
    }
  }
}

copyAssets();
