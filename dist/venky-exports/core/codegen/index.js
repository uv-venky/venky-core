/* Copyright (c) 2024-present Venky Corp. */
/**
 * Build-time codegen utilities for consuming apps (no Next.js / runtime deps).
 *
 * Lets apps generate their `param-schemas.generated.ts` with the same logic as
 * core instead of vendoring the script. Usage in an app's codegen wrapper:
 *
 *   import { generateActionParamSchemas } from 'venky-core/codegen';
 *   await generateActionParamSchemas({ projectRoot: process.cwd() });
 */
export { generateActionParamSchemas } from '../../../lib/codegen/action-param-schemas';
//# sourceMappingURL=index.js.map
