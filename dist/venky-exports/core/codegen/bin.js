#!/usr/bin/env node
/* Copyright (c) 2024-present Venky Corp. */
/**
 * CLI for `venky-core/codegen`. Lets consuming apps regenerate their
 * `param-schemas.generated.ts` with zero wrapper code:
 *
 *   "scripts": { "codegen:action-params": "venky-codegen-action-params" }
 *
 * Run from the project root; the generator uses `process.cwd()` to resolve the
 * actions index, tsconfig, and output paths.
 */
// Relative import with an explicit `.js` extension: this file is executed by
// plain `node` (via the bin shim), which needs full ESM specifiers — unlike the
// `@/`-aliased, extensionless imports the bundler-targeted package uses elsewhere.
import { generateActionParamSchemas } from '../../../lib/codegen/action-param-schemas.js';
generateActionParamSchemas({ projectRoot: process.cwd() }).catch((err) => {
  console.error(err);
  process.exit(1);
});
//# sourceMappingURL=bin.js.map
