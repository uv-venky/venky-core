#!/usr/bin/env node

/**
 * Update pnpm.overrides Script
 *
 * Updates overrides in pnpm-workspace.yaml to the latest versions.
 * This complements npm-check-updates which doesn't handle overrides.
 *
 * Usage:
 *   node scripts/update-overrides.js              # Show what would be updated
 *   node scripts/update-overrides.js --update      # Actually update the overrides
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPnpmWorkspaceConfig, writePnpmWorkspaceConfig } from './pnpm-workspace-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Parse command line args
const args = process.argv.slice(2);
const shouldUpdate = args.includes('--update');

function getLatestVersion(packageName) {
  try {
    // Use npm view to get the latest version
    const result = execSync(`npm view ${packageName} version`, {
      encoding: 'utf-8',
      cwd: PROJECT_ROOT,
    });
    return result.trim();
  } catch (error) {
    console.warn(`  ⚠️  Could not fetch version for ${packageName}`);
    console.error(error);
    return null;
  }
}

function parseOverrideKey(overrideKey) {
  // Handle scoped packages and nested overrides like "react-archer>react"
  if (overrideKey.includes('>')) {
    const [parent, child] = overrideKey.split('>');
    return { parent, child, isNested: true };
  }
  return { package: overrideKey, isNested: false };
}

async function updateOverrides() {
  console.info('📦 Updating pnpm.overrides\n');

  const { configPath, config } = readPnpmWorkspaceConfig(PROJECT_ROOT);

  if (!config.overrides) {
    console.info('ℹ️  No overrides found in pnpm-workspace.yaml\n');
    return;
  }

  const overrides = config.overrides;
  const updates = [];
  const errors = [];

  console.info('Checking for updates...\n');

  // Check each override (skip $refs - they use root's version and should not be updated)
  for (const [overrideKey, currentVersion] of Object.entries(overrides)) {
    if (
      typeof currentVersion === 'string' &&
      (currentVersion.startsWith('$') || currentVersion.startsWith('catalog:'))
    ) {
      continue;
    }
    const parsed = parseOverrideKey(overrideKey);

    if (parsed.isNested) {
      // For nested overrides like "react-archer>react", check the child package
      const latestVersion = getLatestVersion(parsed.child);
      if (latestVersion && latestVersion !== currentVersion) {
        updates.push({
          key: overrideKey,
          current: currentVersion,
          latest: latestVersion,
        });
      } else if (!latestVersion) {
        errors.push(overrideKey);
      }
    } else {
      // For direct overrides, check the package itself
      const latestVersion = getLatestVersion(parsed.package);
      if (latestVersion && latestVersion !== currentVersion) {
        updates.push({
          key: overrideKey,
          current: currentVersion,
          latest: latestVersion,
        });
      } else if (!latestVersion) {
        errors.push(overrideKey);
      }
    }
  }

  // Print results
  if (updates.length === 0 && errors.length === 0) {
    console.info('✅ All overrides are up to date!\n');
    return;
  }

  if (updates.length > 0) {
    console.info('📋 Available updates:\n');
    console.info('─'.repeat(60));
    for (const update of updates) {
      console.info(`  ${update.key.padEnd(40)} ${update.current} → ${update.latest}`);
    }
    console.info();
  }

  if (errors.length > 0) {
    console.info('⚠️  Could not check these overrides:\n');
    for (const error of errors) {
      console.info(`  ${error}`);
    }
    console.info();
  }

  // Apply updates if requested
  if (shouldUpdate && updates.length > 0) {
    console.info('🔄 Updating overrides...\n');

    for (const update of updates) {
      config.overrides[update.key] = update.latest;
      console.info(`  ✅ ${update.key}: ${update.current} → ${update.latest}`);
    }

    writePnpmWorkspaceConfig(configPath, config);
    console.info(`\n✅ Updated ${updates.length} override(s)\n`);
  } else if (updates.length > 0) {
    console.info('💡 Run with --update flag to apply these changes\n');
  }
}

updateOverrides().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
