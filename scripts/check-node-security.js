#!/usr/bin/env node
/* Copyright (c) 2024-present Venky Corp. */

/**
 * Security Check Script for Node.js December 2025 Security Releases
 * Checks if the current Node.js version is vulnerable to CVE-2025-55131, CVE-2025-55130, etc.
 *
 * Required versions:
 * - Node.js 20.x → 20.20.0+
 * - Node.js 22.x → 22.22.0+
 * - Node.js 24.x → 24.13.0+
 * - Node.js 25.x → 25.3.0+
 */

const nodeVersion = process.version;
const [major, minor, patch] = nodeVersion.replace('v', '').split('.').map(Number);

const requiredVersions = {
  20: { minor: 20, patch: 0 },
  22: { minor: 22, patch: 0 },
  24: { minor: 13, patch: 0 },
  25: { minor: 3, patch: 0 },
};

function isVulnerable() {
  const required = requiredVersions[major];
  if (!required) {
    return { vulnerable: false, reason: `Node.js ${major}.x is not an active release line` };
  }

  if (minor < required.minor || (minor === required.minor && patch < required.patch)) {
    return {
      vulnerable: true,
      reason: `Node.js ${nodeVersion} is vulnerable. Required: ${major}.${required.minor}.${required.patch}+`,
    };
  }

  return { vulnerable: false, reason: `Node.js ${nodeVersion} is patched` };
}

const result = isVulnerable();

console.info('Node.js Security Check - December 2025 Release');
console.info('==============================================');
console.info(`Current version: ${nodeVersion}`);
console.info(`Status: ${result.vulnerable ? '⚠️  VULNERABLE' : '✅ SECURE'}`);
console.info(`Details: ${result.reason}`);
console.info('');

if (result.vulnerable) {
  console.info('Affected CVEs:');
  console.info('  - CVE-2025-55131 (High) - Buffer.alloc race condition');
  console.info('  - CVE-2025-55130 (High) - File system permissions bypass');
  console.info('  - CVE-2025-59465 (High) - HTTP/2 server crash');
  console.info('  - CVE-2025-59466 (Medium) - Stack overflow via async_hooks');
  console.info('  - CVE-2025-55132 (Low) - fs.futimes() permission bypass');
  console.info('');
  console.info('Action required: Update Node.js to the latest version');
  console.info(`  Required: Node.js ${major}.${requiredVersions[major].minor}.${requiredVersions[major].patch}+`);
  console.info('');
  console.info('Update commands:');
  console.info('  - Using nvm: nvm install 22.22.0 && nvm use 22.22.0');
  console.info('  - Using fnm: fnm install 22.22.0 && fnm use 22.22.0');
  console.info('  - Download from: https://nodejs.org/');
  process.exit(1);
} else {
  console.info('✅ Your Node.js version is secure.');
  process.exit(0);
}
