/* Copyright (c) 2024-present Venky Corp. */

/**
 * Reusable codegen for `ACTION_PARAM_SCHEMAS`, shared by `venky-core` and
 * its consuming apps so they don't each maintain a divergent copy of the
 * script. Consuming apps call {@link generateActionParamSchemas} from a thin
 * wrapper (or the `venky-codegen-action-params` bin) instead of vendoring this
 * logic.
 *
 * It reads the project's `ACTIONS` object and `ActionName` union via the
 * TypeScript type checker, derives a loose param-type for each positional
 * action parameter (precise where statically knowable, `object` otherwise),
 * tracks optionality/nullability, and writes `param-schemas.generated.ts`.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import fsAsync from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';

export type ParamType = 'string' | 'number' | 'boolean' | 'object';

export interface GeneratedParamEntry {
  name: string;
  label: string;
  type: ParamType;
  optional: boolean;
  nullable: boolean;
}

export interface GenerateActionParamSchemasOptions {
  /** Project root used to resolve defaults. Defaults to `process.cwd()`. */
  projectRoot?: string;
  /** Path to the actions index. Defaults to `<root>/src/lib/server/actions/index.ts`. */
  actionsIndexPath?: string;
  /** Output file. Defaults to `<root>/src/lib/server/actions/param-schemas.generated.ts`. */
  outputPath?: string;
  /** tsconfig used to build the program. Defaults to `<root>/tsconfig.json`. */
  tsconfigPath?: string;
  /** Optional logger for progress/warnings. Defaults to `console`. */
  logger?: Pick<Console, 'info' | 'warn'>;
  /** Run the project's biome over the generated file (default `true`). */
  format?: boolean;
}

/**
 * Map a parameter's TypeScript type to a loose param-type. Unions are resolved
 * by stripping `null`/`undefined`: a single remaining member maps to its kind,
 * and a union whose members all map to the same kind collapses to that kind
 * (e.g. `'a' | 'b'` → `string`); otherwise the type is `object`.
 *
 * The union-resolution behavior originated in metro-one-cop's vendored copy of
 * this script and was consolidated here.
 */
function mapTsTypeToParamType(checker: ts.TypeChecker, type: ts.Type): ParamType {
  if (type.isUnion()) {
    const nonNullableTypes = type.types.filter(
      (member) => !(member.getFlags() & ts.TypeFlags.Undefined) && !(member.getFlags() & ts.TypeFlags.Null),
    );
    if (nonNullableTypes.length === 1) {
      return mapTsTypeToParamType(checker, nonNullableTypes[0]);
    }
    if (nonNullableTypes.length > 1) {
      const mappedKinds = new Set(nonNullableTypes.map((member) => mapTsTypeToParamType(checker, member)));
      if (mappedKinds.size === 1) {
        return [...mappedKinds][0];
      }
    }
  }
  const flags = type.getFlags();
  if (flags & ts.TypeFlags.String) return 'string';
  if (flags & ts.TypeFlags.Number) return 'number';
  if (flags & ts.TypeFlags.Boolean) return 'boolean';
  if (flags & ts.TypeFlags.Undefined || flags & ts.TypeFlags.Null) return 'string';
  const str = checker.typeToString(type);
  if (str === 'string') return 'string';
  if (str === 'number') return 'number';
  if (str === 'boolean') return 'boolean';
  return 'object';
}

function typeIncludesFlag(type: ts.Type, flag: ts.TypeFlags): boolean {
  if (type.isUnion()) {
    return type.types.some((member) => (member.getFlags() & flag) !== 0);
  }
  return (type.getFlags() & flag) !== 0;
}

function isParamOptional(paramDecl: ts.ParameterDeclaration | undefined, paramType: ts.Type): boolean {
  if (paramDecl) {
    if (paramDecl.questionToken) return true;
    if (paramDecl.initializer) return true;
  }
  return typeIncludesFlag(paramType, ts.TypeFlags.Undefined);
}

function isParamNullable(paramType: ts.Type): boolean {
  return typeIncludesFlag(paramType, ts.TypeFlags.Null);
}

function humanizeParamName(name: string): string {
  if (!name.length) return name;
  const withSpaces = name.replace(/([A-Z])/g, ' $1').trim();
  const lower = withSpaces.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function collectParamSchemas(
  checker: ts.TypeChecker,
  actionsType: ts.Type,
  actionsNode: ts.Node,
): Record<string, GeneratedParamEntry[]> {
  const result: Record<string, GeneratedParamEntry[]> = {};
  for (const symbol of actionsType.getProperties()) {
    const actionName = symbol.name;
    const propType = checker.getTypeOfSymbolAtLocation(symbol, actionsNode);
    if (!propType) continue;
    const callSigs = propType.getCallSignatures();
    if (callSigs.length === 0) {
      result[actionName] = [];
      continue;
    }
    const sig = callSigs[0];
    const params = sig.getParameters();
    const paramEntries: GeneratedParamEntry[] = [];
    const decl = sig.getDeclaration();
    // Skip the leading (client, session) params.
    for (let i = 2; i < params.length; i++) {
      const param = params[i];
      const name = param.name;
      const paramDecl = decl && 'parameters' in decl ? decl.parameters?.[i] : undefined;
      const paramType = paramDecl
        ? checker.getTypeAtLocation(paramDecl)
        : (checker.getDeclaredTypeOfSymbol(param) ?? checker.getAnyType());
      paramEntries.push({
        name,
        label: humanizeParamName(name),
        type: mapTsTypeToParamType(checker, paramType),
        optional: isParamOptional(paramDecl, paramType),
        nullable: isParamNullable(paramType),
      });
    }
    result[actionName] = paramEntries;
  }
  return result;
}

function findActionsDeclaration(sourceFile: ts.SourceFile): ts.VariableDeclaration | null {
  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === 'ACTIONS') {
        return decl;
      }
    }
  }
  return null;
}

function findActionNameTypeAlias(sourceFile: ts.SourceFile): ts.TypeAliasDeclaration | null {
  for (const stmt of sourceFile.statements) {
    if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === 'ActionName') {
      return stmt;
    }
  }
  return null;
}

function collectTypeStringLiterals(type: ts.Type, names: Set<string>): void {
  if (type.isUnion()) {
    for (const member of type.types) {
      collectTypeStringLiterals(member, names);
    }
    return;
  }
  if (type.isStringLiteral()) {
    names.add(type.value);
  }
}

function collectActionNames(checker: ts.TypeChecker, typeAlias: ts.TypeAliasDeclaration): Set<string> {
  const names = new Set<string>();
  collectTypeStringLiterals(checker.getTypeAtLocation(typeAlias), names);
  return names;
}

function generateOutput(schemas: Record<string, GeneratedParamEntry[]>): string {
  const lines: string[] = [
    '/* Copyright (c) 2024-present Venky Corp. */',
    '',
    '/** Generated by scripts/codegen-action-param-schemas.ts – do not edit. */',
    '',
    "import type { ActionName } from './index';",
    '',
    'export type ActionParamSchemaEntry = {',
    '  name: string;',
    '  label: string;',
    "  type: 'string' | 'number' | 'boolean' | 'object';",
    '  optional?: boolean;',
    '  nullable?: boolean;',
    '};',
    '',
    'export const ACTION_PARAM_SCHEMAS: Record<ActionName, ActionParamSchemaEntry[]> = {',
  ];
  for (const actionName of Object.keys(schemas).sort()) {
    const params = schemas[actionName];
    if (params.length === 0) {
      lines.push(`  ${actionName}: [],`);
      continue;
    }
    lines.push(`  ${actionName}: [`);
    for (const p of params) {
      const extras = [p.optional ? 'optional: true' : '', p.nullable ? 'nullable: true' : '']
        .filter(Boolean)
        .join(', ');
      const suffix = extras ? `, ${extras}` : '';
      lines.push(
        `    { name: ${JSON.stringify(p.name)}, label: ${JSON.stringify(p.label)}, type: ${JSON.stringify(p.type)}${suffix} },`,
      );
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

/**
 * Format the generated file in place with the project's own biome binary
 * (resolved from `projectRoot`), so the output is committable as-is. Formatting
 * is best-effort: if biome isn't resolvable, the (correctly generated) file is
 * left unformatted and a visible warning is logged rather than failing codegen.
 */
function formatWithBiome(filePath: string, projectRoot: string, logger: Pick<Console, 'info' | 'warn'>): void {
  let biomeBin: string;
  try {
    const requireFrom = createRequire(path.join(projectRoot, 'package.json'));
    const biomePkgPath = requireFrom.resolve('@biomejs/biome/package.json');
    const biomePkg = JSON.parse(fs.readFileSync(biomePkgPath, 'utf8')) as { bin?: string | Record<string, string> };
    const binRel = typeof biomePkg.bin === 'string' ? biomePkg.bin : biomePkg.bin?.biome;
    if (!binRel) throw new Error('no "biome" bin entry in @biomejs/biome');
    biomeBin = path.join(path.dirname(biomePkgPath), binRel);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    logger.warn(
      `Skipped biome formatting: @biomejs/biome not resolvable from ${projectRoot} (${reason}). ` +
        `The generated file is correct but unformatted — run biome (or your pre-commit hook) over it.`,
    );
    return;
  }
  try {
    execFileSync(process.execPath, [biomeBin, 'format', '--write', filePath], { cwd: projectRoot, stdio: 'ignore' });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    logger.warn(`biome format failed for ${filePath} (${reason}); the file is generated but unformatted.`);
  }
}

/**
 * Generate the `param-schemas.generated.ts` file for a project. Returns the
 * absolute path written.
 */
export async function generateActionParamSchemas(options: GenerateActionParamSchemasOptions = {}): Promise<string> {
  const root = options.projectRoot ?? process.cwd();
  const actionsIndexPath = options.actionsIndexPath ?? path.join(root, 'src/lib/server/actions/index.ts');
  const outputPath = options.outputPath ?? path.join(root, 'src/lib/server/actions/param-schemas.generated.ts');
  const tsconfigPath = options.tsconfigPath ?? path.join(root, 'tsconfig.json');
  const logger = options.logger ?? console;

  const configFile = ts.readConfigFile(tsconfigPath, (p) => fs.readFileSync(p, 'utf8'));
  if (configFile.error) {
    throw new Error(`Failed to read tsconfig: ${configFile.error.messageText}`);
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();

  const actionsSource = program.getSourceFile(actionsIndexPath);
  if (!actionsSource) {
    throw new Error(`Source file not found: ${actionsIndexPath}`);
  }

  const actionsDecl = findActionsDeclaration(actionsSource);
  if (!actionsDecl?.initializer) {
    throw new Error('ACTIONS declaration not found in index.ts');
  }
  const actionsType = checker.getTypeAtLocation(actionsDecl.initializer);
  const allSchemas = collectParamSchemas(checker, actionsType, actionsDecl.initializer);

  // Enumerate by the ActionName union so the generated Record<ActionName, …> has
  // exactly the right keys (no missing/extra), regardless of how ACTIONS is built.
  // Originated in metro-one-vm@d361439 ("Support multiple departments per user"),
  // where adding actions exposed an ACTIONS-vs-ActionName key mismatch; consolidated here.
  const actionNameAlias = findActionNameTypeAlias(actionsSource);
  if (!actionNameAlias) {
    throw new Error('ActionName type alias not found in index.ts');
  }
  const allowedActionNames = collectActionNames(checker, actionNameAlias);
  if (allowedActionNames.size === 0) {
    throw new Error('ActionName resolved to no string literals');
  }

  const schemas: Record<string, GeneratedParamEntry[]> = {};
  for (const actionName of allowedActionNames) {
    schemas[actionName] = allSchemas[actionName] ?? [];
  }
  for (const actionName of Object.keys(allSchemas)) {
    if (!allowedActionNames.has(actionName)) {
      logger.warn(`Skipping ${actionName}: present in ACTIONS but not in ActionName`);
    }
  }

  await fsAsync.writeFile(outputPath, generateOutput(schemas), 'utf8');
  if (options.format !== false) {
    formatWithBiome(outputPath, root, logger);
  }
  logger.info(`Wrote ${outputPath}`);
  return outputPath;
}
