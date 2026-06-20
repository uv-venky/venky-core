/* Copyright (c) 2024-present Venky Corp. */

/**
 * Codegen: ACTION_PARAM_SCHEMAS from server action signatures.
 * Run: pnpm codegen:action-params
 * Output: src/lib/server/actions/param-schemas.generated.ts
 *
 * The logic lives in `src/lib/codegen/action-param-schemas.ts` and is published
 * as `venky-core/codegen` so consuming apps run the same generator instead
 * of vendoring a copy. This wrapper just points it at the core project root.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateActionParamSchemas } from '../src/lib/codegen/action-param-schemas';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

generateActionParamSchemas({ projectRoot }).catch((err) => {
  console.error(err);
  process.exit(1);
});
