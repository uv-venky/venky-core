import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const skipDirs = new Set(['node_modules', 'dist', '.next', '.git']);
const extensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.jsonc',
  '.yml',
  '.yaml',
  '.md',
  '.mdc',
  '.sql',
  '.css',
  '.html',
  '.sh',
  '.ps1',
]);

function applyRebrand(content) {
  const replacements = [
    ['venky-core', 'venky-core'],
    ['venky-exports', 'venky-exports'],
    ['venky-codegen-action-params', 'venky-codegen-action-params'],
    ['venky-server-', 'venky-server-'],
    ['venky-session', 'venky-session'],
    ['venky-devtools', 'venky-devtools'],
    ['venky-debug', 'venky-debug'],
    ['venky-csrf', 'venky-csrf'],
    ['venky-oom', 'venky-oom'],
    ['venky-rs', 'venky-rs'],
    ['uv-venky', 'uv-venky'],
    ['venky.local', 'venky.local'],
    ['venky.UserError', 'venky.UserError'],
    ['venky.pgPoolReadOnlyInitialized', 'venky.pgPoolReadOnlyInitialized'],
    ['VenkyToolContext', 'VenkyToolContext'],
    ['VenkyTool', 'VenkyTool'],
    ['Venky Core', 'Venky Core'],
    ['Venky Core', 'Venky Core'],
    ['Venky Corp.', 'Venky Corp.'],
    ['Venky redirect', 'Venky redirect'],
    ['Venky UI', 'Venky UI'],
    ['Venky-hosted', 'Venky-hosted'],
    ['per-Venky', 'per-Venky'],
    ['Venky admin', 'Venky admin'],
    ['Venky instance', 'Venky instance'],
    ['Venky runtime', 'Venky runtime'],
    ['Venky controls', 'Venky controls'],
    ['Venky', 'Venky'],
    ['Venky-published', 'Venky-published'],
    ['venky-ui-patterns', 'venky-ui-patterns'],
    ['venky-data-patterns', 'venky-data-patterns'],
    ['venky-testing-patterns', 'venky-testing-patterns'],
    ['venky-nextjs-patterns', 'venky-nextjs-patterns'],
    ['venky-rs-ip', 'venky-rs-ip'],
    ['VENKY_', 'VENKY_'],
    ['VENKY', 'VENKY'],
    ['Venky', 'Venky'],
    ['venky', 'venky'],
  ];
  let result = content;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }
  return result;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  const ext = path.extname(file);
  const base = path.basename(file);
  if (!extensions.has(ext) && base !== '.cursorrules') continue;
  const content = fs.readFileSync(file, 'utf8');
  const updated = applyRebrand(content);
  if (updated !== content) {
    fs.writeFileSync(file, updated);
    changed++;
  }
}

process.stdout.write(`Rebrand complete. Updated ${changed} files.\n`);
