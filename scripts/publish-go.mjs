/* Copyright (c) 2024-present Venky Corp. */
import { execSync } from 'node:child_process';

function run(command) {
  execSync(command, { stdio: 'inherit', env: process.env });
}

const token = execSync('gh auth token', { encoding: 'utf8' }).trim();
if (!token) {
  console.error('Failed to get GitHub token from `gh auth token`');
  process.exit(1);
}

process.env.GITHUB_TOKEN = token;
run('npm publish');
run('pnpm sync-deps:fix');
