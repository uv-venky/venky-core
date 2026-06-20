#!/usr/bin/env node

/**
 * Dependency Sync Script
 *
 * Compares package.json dependencies from consuming projects against core
 * and syncs them to match core's versions.
 *
 * Usage:
 *   node scripts/sync-deps.js              # Compare all projects
 *   node scripts/sync-deps.js --sync       # Sync mismatched versions
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  arraysEqual,
  getMinimumReleaseAgeExclude,
  getPnpmCatalog,
  getPnpmOverrides,
  readPnpmWorkspaceConfig,
  writePnpmWorkspaceConfig,
} from './pnpm-workspace-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

// Consuming projects (excluding core)
const CONSUMING_PROJECTS = [
  'exol-oms',
  'metro-one-cc',
  'donezie',
  'demo',
  'metro-one-tim',
  'metro-one-vm',
  'metro-one-ccx',
  'metro-one-cop',
  'cdsw',
  'metro-one-lms',
];

// Parse command line args
const args = process.argv.slice(2);
const shouldSync = args.includes('--sync');

function readPackageJson(project) {
  const pkgPath = path.join(WORKSPACE_ROOT, project, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
}

function writePackageJson(project, pkg) {
  const pkgPath = path.join(WORKSPACE_ROOT, project, 'package.json');
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function getAllDependencies(pkg) {
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
}

function findMismatches(corePkg, consumingPkgs) {
  const coreDeps = getAllDependencies(corePkg);
  const mismatches = [];

  for (const [project, pkg] of Object.entries(consumingPkgs)) {
    if (!pkg) continue;

    const projectDeps = getAllDependencies(pkg);
    const projectMismatches = [];

    // Check all dependencies that exist in both core and this project
    for (const [pkgName, coreVersion] of Object.entries(coreDeps)) {
      // Skip venky-core - it's handled separately
      if (pkgName === 'venky-core') continue;

      const projectVersion = projectDeps[pkgName];
      if (projectVersion && projectVersion !== coreVersion) {
        projectMismatches.push({
          package: pkgName,
          current: projectVersion,
          expected: coreVersion,
          location: pkg.dependencies?.[pkgName] ? 'dependencies' : 'devDependencies',
        });
      }
    }

    if (projectMismatches.length > 0) {
      mismatches.push({
        project,
        mismatches: projectMismatches,
      });
    }
  }

  return mismatches;
}

function findPnpmOverridesMismatches(coreOverrides, consumingPkgs) {
  const mismatches = [];

  for (const [project, pkg] of Object.entries(consumingPkgs)) {
    if (!pkg) continue;

    const projectOverrides = getPnpmOverrides(path.join(WORKSPACE_ROOT, project));
    const projectMismatches = [];

    // Check all overrides that exist in core
    for (const [overrideKey, coreVersion] of Object.entries(coreOverrides)) {
      const projectVersion = projectOverrides[overrideKey];
      if (projectVersion !== coreVersion) {
        projectMismatches.push({
          override: overrideKey,
          current: projectVersion || '(missing)',
          expected: coreVersion,
        });
      }
    }

    // Check for overrides in project that don't exist in core (optional - could be project-specific)
    // We'll only sync core's overrides, not remove project-specific ones

    if (projectMismatches.length > 0) {
      mismatches.push({
        project,
        mismatches: projectMismatches,
      });
    }
  }

  return mismatches;
}

function findPnpmCatalogMismatches(coreCatalog, consumingPkgs) {
  const mismatches = [];

  for (const [project, pkg] of Object.entries(consumingPkgs)) {
    if (!pkg) continue;

    const projectCatalog = getPnpmCatalog(path.join(WORKSPACE_ROOT, project));
    const projectMismatches = [];

    for (const [catalogKey, coreVersion] of Object.entries(coreCatalog)) {
      const projectVersion = projectCatalog[catalogKey];
      if (projectVersion !== coreVersion) {
        projectMismatches.push({
          catalogKey,
          current: projectVersion || '(missing)',
          expected: coreVersion,
        });
      }
    }

    if (projectMismatches.length > 0) {
      mismatches.push({
        project,
        mismatches: projectMismatches,
      });
    }
  }

  return mismatches;
}

function checkCoreVersion(corePkg, consumingPkgs) {
  const coreVersion = corePkg.version;
  const mismatches = [];

  for (const [project, pkg] of Object.entries(consumingPkgs)) {
    if (!pkg) continue;

    const depVersion = pkg.dependencies?.['venky-core'];
    if (depVersion && depVersion !== coreVersion) {
      mismatches.push({
        project,
        current: depVersion,
        expected: coreVersion,
      });
    }
  }

  return { mismatches, coreVersion };
}

function findPnpmSettingsMismatches(corePkg, consumingPkgs) {
  const expectedPackageManager = corePkg.packageManager;
  const expectedMinimumReleaseAgeExclude = getMinimumReleaseAgeExclude(path.join(WORKSPACE_ROOT, 'core'));
  const mismatches = [];

  for (const [project, pkg] of Object.entries(consumingPkgs)) {
    if (!pkg) continue;

    const projectMismatches = [];

    if (expectedPackageManager && pkg.packageManager !== expectedPackageManager) {
      projectMismatches.push({
        setting: 'packageManager',
        current: pkg.packageManager || '(missing)',
        expected: expectedPackageManager,
      });
    }

    const projectMinimumReleaseAgeExclude = getMinimumReleaseAgeExclude(path.join(WORKSPACE_ROOT, project));
    if (!arraysEqual(projectMinimumReleaseAgeExclude, expectedMinimumReleaseAgeExclude)) {
      projectMismatches.push({
        setting: 'minimumReleaseAgeExclude',
        current: projectMinimumReleaseAgeExclude.length ? projectMinimumReleaseAgeExclude.join(', ') : '(missing)',
        expected: expectedMinimumReleaseAgeExclude.join(', '),
      });
    }

    if (projectMismatches.length > 0) {
      mismatches.push({
        project,
        mismatches: projectMismatches,
      });
    }
  }

  return mismatches;
}

function printMismatches(
  coreVersion,
  coreVersionMismatches,
  dependencyMismatches,
  pnpmOverridesMismatches,
  pnpmCatalogMismatches,
  pnpmSettingsMismatches,
) {
  if (
    coreVersionMismatches.length === 0 &&
    dependencyMismatches.length === 0 &&
    pnpmOverridesMismatches.length === 0 &&
    pnpmCatalogMismatches.length === 0 &&
    pnpmSettingsMismatches.length === 0
  ) {
    console.info('\n✅ All dependencies are in sync!\n');
    return;
  }

  // Print venky-core version mismatches
  if (coreVersionMismatches.length > 0) {
    console.info(`\n🔴 venky-core version mismatch (expected: ${coreVersion}):\n`);
    console.info('─'.repeat(60));
    for (const m of coreVersionMismatches) {
      console.info(`  ${m.project.padEnd(20)} ${m.current} → ${coreVersion}`);
    }
    console.info();
  }

  // Print dependency mismatches
  if (dependencyMismatches.length > 0) {
    console.info(`\n⚠️  Found dependency mismatches:\n`);
    for (const projectMismatch of dependencyMismatches) {
      console.info(`  ${projectMismatch.project}:`);
      for (const m of projectMismatch.mismatches) {
        console.info(`    ${m.package.padEnd(30)} ${m.current} → ${m.expected}`);
      }
    }
    console.info();
  }

  // Print pnpm.overrides mismatches
  if (pnpmOverridesMismatches.length > 0) {
    console.info(`\n⚠️  Found pnpm.overrides mismatches:\n`);
    for (const projectMismatch of pnpmOverridesMismatches) {
      console.info(`  ${projectMismatch.project}:`);
      for (const m of projectMismatch.mismatches) {
        console.info(`    ${m.override.padEnd(40)} ${m.current} → ${m.expected}`);
      }
    }
    console.info();
  }

  if (pnpmCatalogMismatches.length > 0) {
    console.info(`\n⚠️  Found pnpm catalog mismatches:\n`);
    for (const projectMismatch of pnpmCatalogMismatches) {
      console.info(`  ${projectMismatch.project}:`);
      for (const m of projectMismatch.mismatches) {
        console.info(`    ${m.catalogKey.padEnd(40)} ${m.current} → ${m.expected}`);
      }
    }
    console.info();
  }

  if (pnpmSettingsMismatches.length > 0) {
    console.info(`\n⚠️  Found pnpm settings mismatches:\n`);
    for (const projectMismatch of pnpmSettingsMismatches) {
      console.info(`  ${projectMismatch.project}:`);
      for (const m of projectMismatch.mismatches) {
        console.info(`    ${m.setting.padEnd(30)} ${m.current} → ${m.expected}`);
      }
    }
    console.info();
  }
}

function syncDependencies(corePkg, consumingPkgs, mismatches) {
  const coreDeps = getAllDependencies(corePkg);
  let changeCount = 0;

  for (const projectMismatch of mismatches) {
    const pkg = consumingPkgs[projectMismatch.project];
    if (!pkg) continue;

    let changed = false;

    for (const m of projectMismatch.mismatches) {
      const targetVersion = coreDeps[m.package];
      if (!targetVersion) continue;

      // Update in dependencies
      if (pkg.dependencies?.[m.package]) {
        console.info(`  ${projectMismatch.project}: ${m.package} ${pkg.dependencies[m.package]} → ${targetVersion}`);
        pkg.dependencies[m.package] = targetVersion;
        changed = true;
        changeCount++;
      }

      // Update in devDependencies
      if (pkg.devDependencies?.[m.package]) {
        console.info(
          `  ${projectMismatch.project}: ${m.package} ${pkg.devDependencies[m.package]} → ${targetVersion} (dev)`,
        );
        pkg.devDependencies[m.package] = targetVersion;
        changed = true;
        changeCount++;
      }
    }

    if (changed) {
      writePackageJson(projectMismatch.project, pkg);
    }
  }

  return changeCount;
}

function syncPnpmSettings(corePkg, mismatches) {
  const expectedMinimumReleaseAgeExclude = getMinimumReleaseAgeExclude(path.join(WORKSPACE_ROOT, 'core'));
  let changeCount = 0;

  for (const projectMismatch of mismatches) {
    for (const m of projectMismatch.mismatches) {
      if (m.setting === 'packageManager') {
        const pkg = readPackageJson(projectMismatch.project);
        if (!pkg) continue;

        console.info(`  ${projectMismatch.project}: packageManager ${m.current} → ${m.expected}`);
        pkg.packageManager = corePkg.packageManager;
        writePackageJson(projectMismatch.project, pkg);
        changeCount++;
      }

      if (m.setting === 'minimumReleaseAgeExclude') {
        const projectRoot = path.join(WORKSPACE_ROOT, projectMismatch.project);
        const { configPath, config } = readPnpmWorkspaceConfig(projectRoot);

        if (!config.packages) {
          config.packages = ['.'];
        }

        console.info(`  ${projectMismatch.project}: minimumReleaseAgeExclude ${m.current} → ${m.expected}`);
        config.minimumReleaseAgeExclude = [...expectedMinimumReleaseAgeExclude];
        writePnpmWorkspaceConfig(configPath, config);
        changeCount++;
      }
    }
  }

  return changeCount;
}

function syncPnpmOverrides(coreOverrides, mismatches) {
  let changeCount = 0;

  for (const projectMismatch of mismatches) {
    const projectRoot = path.join(WORKSPACE_ROOT, projectMismatch.project);
    const { configPath, config } = readPnpmWorkspaceConfig(projectRoot);
    if (!config.overrides) {
      config.overrides = {};
    }

    let changed = false;

    for (const m of projectMismatch.mismatches) {
      const targetVersion = coreOverrides[m.override];
      if (!targetVersion) continue;

      console.info(`  ${projectMismatch.project}: overrides[${m.override}] ${m.current} → ${targetVersion}`);
      config.overrides[m.override] = targetVersion;
      changed = true;
      changeCount++;
    }

    if (changed) {
      writePnpmWorkspaceConfig(configPath, config);
    }
  }

  return changeCount;
}

function syncPnpmCatalog(coreCatalog, mismatches) {
  let changeCount = 0;

  for (const projectMismatch of mismatches) {
    const projectRoot = path.join(WORKSPACE_ROOT, projectMismatch.project);
    const { configPath, config } = readPnpmWorkspaceConfig(projectRoot);
    if (!config.catalog) {
      config.catalog = {};
    }

    let changed = false;

    for (const m of projectMismatch.mismatches) {
      const targetVersion = coreCatalog[m.catalogKey];
      if (!targetVersion) continue;

      console.info(`  ${projectMismatch.project}: catalog[${m.catalogKey}] ${m.current} → ${targetVersion}`);
      config.catalog[m.catalogKey] = targetVersion;
      changed = true;
      changeCount++;
    }

    if (changed) {
      writePnpmWorkspaceConfig(configPath, config);
    }
  }

  return changeCount;
}

function syncCoreVersion(consumingPkgs, coreVersion, mismatches) {
  let changeCount = 0;

  for (const m of mismatches) {
    const pkg = consumingPkgs[m.project];
    if (!pkg) continue;

    if (pkg.dependencies?.['venky-core']) {
      console.info(`  ${m.project}: venky-core ${m.current} → ${coreVersion}`);
      pkg.dependencies['venky-core'] = coreVersion;
      writePackageJson(m.project, pkg);
      changeCount++;
    }
  }

  return changeCount;
}

function runPnpmInstall(projects) {
  console.info('\n📦 Running pnpm install on consuming projects...\n');

  for (const project of projects) {
    const projectPath = path.join(WORKSPACE_ROOT, project);
    if (!fs.existsSync(projectPath)) {
      console.info(`  ⚠️  Skipping ${project} (directory not found)`);
      continue;
    }

    console.info(`  ${project}: installing dependencies...`);
    try {
      execSync('pnpm install', {
        cwd: projectPath,
        stdio: 'inherit',
      });
      console.info(`  ✅ ${project}: install done`);
    } catch (error) {
      console.error(`  ❌ ${project}: dependency install failed`);
      console.error(error.message);
      continue;
    }

    const projectPkg = readPackageJson(project);
    if (projectPkg?.scripts?.['codegen:action-params']) {
      console.info(`  ${project}: running codegen:action-params...`);
      try {
        execSync('pnpm codegen:action-params', {
          cwd: projectPath,
          stdio: 'inherit',
        });
        console.info(`  ✅ ${project}: codegen done\n`);
      } catch (error) {
        console.error(`  ❌ ${project}: codegen:action-params failed`);
        console.error(error.message);
      }
    } else {
      console.info(`  ${project}: no codegen:action-params script, skipping\n`);
    }
  }
}

// Main
console.info('📦 Venky Dependency Sync');
console.info('═'.repeat(60));
console.info(`Reference: core`);
console.info(`Consuming projects: ${CONSUMING_PROJECTS.join(', ')}`);

// Load core package.json
const corePkg = readPackageJson('core');
if (!corePkg) {
  console.error('❌ Core package.json not found');
  process.exit(1);
}

// Load consuming project package.json files
const consumingPkgs = {};
for (const project of CONSUMING_PROJECTS) {
  consumingPkgs[project] = readPackageJson(project);
  if (!consumingPkgs[project]) {
    console.info(`⚠️  Skipping ${project} (package.json not found)`);
  }
}

// Check venky-core version
const { mismatches: coreVersionMismatches, coreVersion } = checkCoreVersion(corePkg, consumingPkgs);

// Find dependency mismatches
const dependencyMismatches = findMismatches(corePkg, consumingPkgs);

// Find pnpm.overrides mismatches (core overrides live in pnpm-workspace.yaml)
const coreOverrides = getPnpmOverrides(path.join(WORKSPACE_ROOT, 'core'));
const coreCatalog = getPnpmCatalog(path.join(WORKSPACE_ROOT, 'core'));
const pnpmOverridesMismatches = findPnpmOverridesMismatches(coreOverrides, consumingPkgs);
const pnpmCatalogMismatches = findPnpmCatalogMismatches(coreCatalog, consumingPkgs);
const pnpmSettingsMismatches = findPnpmSettingsMismatches(corePkg, consumingPkgs);

// Print mismatches
printMismatches(
  coreVersion,
  coreVersionMismatches,
  dependencyMismatches,
  pnpmOverridesMismatches,
  pnpmCatalogMismatches,
  pnpmSettingsMismatches,
);

// Sync if requested
const totalMismatches =
  coreVersionMismatches.length +
  dependencyMismatches.length +
  pnpmOverridesMismatches.length +
  pnpmCatalogMismatches.length +
  pnpmSettingsMismatches.length;

if (shouldSync && totalMismatches > 0) {
  console.info('🔄 Syncing dependencies to match core...\n');

  let totalChanges = 0;

  // Sync venky-core version first
  if (coreVersionMismatches.length > 0) {
    console.info('Updating venky-core version:');
    totalChanges += syncCoreVersion(consumingPkgs, coreVersion, coreVersionMismatches);
    console.info();
  }

  // Sync other dependencies
  if (dependencyMismatches.length > 0) {
    console.info('Updating dependencies:');
    totalChanges += syncDependencies(corePkg, consumingPkgs, dependencyMismatches);
    console.info();
  }

  // Sync pnpm.overrides
  if (pnpmOverridesMismatches.length > 0) {
    console.info('Updating pnpm.overrides:');
    totalChanges += syncPnpmOverrides(coreOverrides, pnpmOverridesMismatches);
    console.info();
  }

  if (pnpmCatalogMismatches.length > 0) {
    console.info('Updating pnpm catalog:');
    totalChanges += syncPnpmCatalog(coreCatalog, pnpmCatalogMismatches);
    console.info();
  }

  if (pnpmSettingsMismatches.length > 0) {
    console.info('Updating pnpm settings:');
    totalChanges += syncPnpmSettings(corePkg, pnpmSettingsMismatches);
    console.info();
  }

  if (totalChanges > 0) {
    console.info(`✅ Updated ${totalChanges} version(s)`);

    // Run pnpm install on all consuming projects
    runPnpmInstall(CONSUMING_PROJECTS);

    console.info('\n📝 Next steps:');
    console.info('   1. Run `pnpm typecheck` to verify');
    console.info('   2. Commit the changes');
  } else {
    console.info('\n✅ No changes needed');
  }
} else if (totalMismatches > 0 && !shouldSync) {
  console.info('💡 Run `pnpm sync-deps:fix` to update versions');
}
