/* Copyright (c) 2024-present Venky Corp. */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export function readPnpmWorkspaceConfig(projectRoot) {
  const configPath = path.join(projectRoot, 'pnpm-workspace.yaml');
  if (!fs.existsSync(configPath)) {
    return { configPath, config: {} };
  }

  const config = yaml.load(fs.readFileSync(configPath, 'utf-8')) ?? {};
  return { configPath, config };
}

export function writePnpmWorkspaceConfig(configPath, config) {
  fs.writeFileSync(configPath, `${yaml.dump(config, { lineWidth: -1, quotingType: '"', forceQuotes: false })}`);
}

export function getPnpmOverrides(projectRoot) {
  const { config } = readPnpmWorkspaceConfig(projectRoot);
  return config.overrides ?? {};
}

export function getPnpmCatalog(projectRoot) {
  const { config } = readPnpmWorkspaceConfig(projectRoot);
  return config.catalog ?? {};
}

export function getMinimumReleaseAgeExclude(projectRoot) {
  const { config } = readPnpmWorkspaceConfig(projectRoot);
  return config.minimumReleaseAgeExclude ?? [];
}

export function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}
