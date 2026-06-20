#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const entry = path.join(root, 'src/venky-exports/core/data-ui/client/index.ts');
const forbidden = [/@\/lib\/core\/server\//, /@\/lib\/server\//, /@\/auth\b/, /@\/lib\/core\/server\/ds\//];

const source = fs.readFileSync(entry, 'utf8');
const violations = forbidden.filter((r) => r.test(source));

if (violations.length > 0) {
  console.error('[check-data-ui-client-boundary] Forbidden server import found in data-ui/client entry.');
  process.exit(1);
}
