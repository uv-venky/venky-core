/**
 * Build-time codegen utilities for consuming apps (no Next.js / runtime deps).
 *
 * Lets apps generate their `param-schemas.generated.ts` with the same logic as
 * core instead of vendoring the script. Usage in an app's codegen wrapper:
 *
 *   import { generateActionParamSchemas } from 'venky-core/codegen';
 *   await generateActionParamSchemas({ projectRoot: process.cwd() });
 */
export { generateActionParamSchemas, type GenerateActionParamSchemasOptions, type GeneratedParamEntry, type ParamType, } from '../../../lib/codegen/action-param-schemas';
//# sourceMappingURL=index.d.ts.map