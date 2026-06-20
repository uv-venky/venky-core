#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const serverIndexPath = path.join(repoRoot, 'src/venky-exports/core/server/index.ts');
const serverRoutesPath = path.join(repoRoot, 'src/venky-exports/core/server/routes.ts');

const serverIndex = fs.readFileSync(serverIndexPath, 'utf8');
const serverRoutes = fs.readFileSync(serverRoutesPath, 'utf8');

const violations = [];

if (serverIndex.includes("from './routes'") || serverIndex.includes('from "./routes"')) {
  violations.push(
    "server/index.ts must not re-export server/routes. Import route handlers from 'venky-core/server/routes' only.",
  );
}

if (/['"]@\/app\/api\//.test(serverIndex) || /['"]@\/app\/\(secure\)\/\(chat\)\/api\//.test(serverIndex)) {
  violations.push('server/index.ts must not directly export app/api modules.');
}

if (!/export const .*Route\s*=/.test(serverRoutes)) {
  violations.push('server/routes.ts appears to be missing route exports.');
}

if (violations.length > 0) {
  console.error('\n[check-server-routes-boundary] FAILED');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.info('[check-server-routes-boundary] OK');
