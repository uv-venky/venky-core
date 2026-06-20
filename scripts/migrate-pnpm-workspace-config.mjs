#!/usr/bin/env node
/* Copyright (c) 2024-present Venky Corp. */

/**
 * Migrate pnpm config from package.json to pnpm-workspace.yaml (pnpm 11).
 *
 * Usage:
 *   node scripts/migrate-pnpm-workspace-config.mjs [project-name ...]
 *   node scripts/migrate-pnpm-workspace-config.mjs --all
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

const DEFAULT_PROJECTS = [
  'cdsw',
  'demo',
  'donezie',
  'metro-one-cc',
  'metro-one-ccx',
  'metro-one-cop',
  'metro-one-tim',
  'metro-one-vm',
  'samezie-tasks',
  'venky-base',
];

const args = process.argv.slice(2);
const projects =
  args.includes('--all') || args.length === 0 ? DEFAULT_PROJECTS : args.filter((a) => !a.startsWith('--'));

function normalizeVersion(version) {
  if (typeof version !== 'string') return version;
  return version.replace(/^[\^~>=<]+/, '');
}

function getDepVersion(pkg, name) {
  return pkg.devDependencies?.[name] ?? pkg.dependencies?.[name] ?? pkg.peerDependencies?.[name];
}

function convertOverrideValue(value) {
  if (typeof value === 'string' && value.startsWith('$')) {
    return 'catalog:';
  }
  return value;
}

function readExistingWorkspaceConfig(projectRoot) {
  const configPath = path.join(projectRoot, 'pnpm-workspace.yaml');
  if (!fs.existsSync(configPath)) {
    return { configPath, config: {} };
  }
  return { configPath, config: yaml.load(fs.readFileSync(configPath, 'utf-8')) ?? {} };
}

function collectAllowBuilds(existingConfig, pkg) {
  const allowBuilds = { ...(existingConfig.allowBuilds ?? {}) };

  for (const dep of pkg.pnpm?.onlyBuiltDependencies ?? []) {
    allowBuilds[dep] = true;
  }
  for (const dep of existingConfig.onlyBuiltDependencies ?? []) {
    allowBuilds[dep] = true;
  }
  for (const dep of existingConfig.ignoredBuiltDependencies ?? []) {
    allowBuilds[dep] = true;
  }

  allowBuilds.esbuild = true;
  allowBuilds.sharp = true;

  for (const [dep, value] of Object.entries(allowBuilds)) {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        allowBuilds[dep] = true;
      } else if (value.toLowerCase() === 'false') {
        allowBuilds[dep] = false;
      } else {
        // pnpm 11 placeholder text — default to allowing known native build deps
        allowBuilds[dep] = ['ffmpeg-static', 'canvas', 'onnxruntime-node', 'unrs-resolver'].includes(dep);
      }
    }
  }

  return allowBuilds;
}

function buildWorkspaceConfig(pkg, existingConfig) {
  const react = getDepVersion(pkg, 'react');
  const reactDom = getDepVersion(pkg, 'react-dom');
  const typesReact = getDepVersion(pkg, '@types/react');

  const catalog = { ...(existingConfig.catalog ?? {}) };
  if (react) catalog.react = normalizeVersion(react);
  if (reactDom) catalog['react-dom'] = normalizeVersion(reactDom);
  if (typesReact) catalog['@types/react'] = normalizeVersion(typesReact);

  const overrides = {};
  for (const [key, value] of Object.entries(pkg.pnpm?.overrides ?? {})) {
    overrides[key] = convertOverrideValue(value);
  }

  const config = {
    ...(existingConfig.packages ? { packages: existingConfig.packages } : { packages: ['.'] }),
    ...(Object.keys(catalog).length > 0 ? { catalog } : {}),
    ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
    ...(pkg.pnpm?.peerDependencyRules
      ? { peerDependencyRules: pkg.pnpm.peerDependencyRules }
      : existingConfig.peerDependencyRules
        ? { peerDependencyRules: existingConfig.peerDependencyRules }
        : {}),
    confirmModulesPurge: false,
    allowBuilds: collectAllowBuilds(existingConfig, pkg),
  };

  return config;
}

function writeWorkspaceConfig(configPath, config) {
  fs.writeFileSync(configPath, `${yaml.dump(config, { lineWidth: -1, quotingType: "'", forceQuotes: false })}`);
}

function removePnpmFieldFromPackageJson(projectRoot) {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (!pkg.pnpm) return false;
  delete pkg.pnpm;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

for (const project of projects) {
  const projectRoot = path.join(WORKSPACE_ROOT, project);
  const pkgPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.warn(`⚠️  Skipping ${project} (package.json not found)`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const { configPath, config: existingConfig } = readExistingWorkspaceConfig(projectRoot);
  const hasPnpmField = Boolean(pkg.pnpm);
  const hasLegacyWorkspaceSettings = existingConfig.onlyBuiltDependencies || existingConfig.ignoredBuiltDependencies;

  if (!hasPnpmField && !hasLegacyWorkspaceSettings) {
    console.info(`ℹ️  Skipping ${project} (nothing to migrate)`);
    continue;
  }

  const workspaceConfig = buildWorkspaceConfig(pkg, existingConfig);
  writeWorkspaceConfig(configPath, workspaceConfig);
  const removedPnpmField = removePnpmFieldFromPackageJson(projectRoot);

  console.info(
    `✅ ${project}: wrote ${path.relative(WORKSPACE_ROOT, configPath)}${removedPnpmField ? ', removed package.json pnpm field' : ''}`,
  );
}
