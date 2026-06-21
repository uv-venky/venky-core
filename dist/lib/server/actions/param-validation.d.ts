/**
 * Runtime validation of server-action parameters.
 *
 * Derives a zod validator from the per-action {@link ActionParamSchemaEntry}
 * metadata (generated from action signatures, see
 * `scripts/codegen-action-param-schemas.ts`). Enforced centrally in
 * `invokeAction` so every `/api/action` call is shape-checked before the action
 * body runs.
 *
 * Strictness policy:
 * - `string` / `number` / `boolean` → strict primitive checks (no coercion).
 * - `object` → pass-through (`z.unknown()`) by default, so opaque/union/array
 *   params never produce false positives. Tighten a specific param by adding a
 *   precise schema to `ACTION_PARAM_OVERRIDES`.
 * - Optional params (trailing `?`/`| undefined`) may be omitted; arity is
 *   otherwise strict (extra args are rejected).
 */
import { z } from 'zod';
import type { ActionParamSchemaEntry } from './registry-context';
import { type ActionParamOverrides } from './param-schemas.overrides';
/** Build a zod tuple validator for an action's positional params. */
export declare function buildActionParamValidator(action: string, entries: ActionParamSchemaEntry[], overrides?: ActionParamOverrides): z.ZodType<unknown[]>;
/**
 * Validate an action's args against its param schema. Returns the parsed args
 * on success; throws {@link UserError} on any mismatch.
 */
export declare function validateActionParams(action: string, entries: ActionParamSchemaEntry[], args: unknown[], overrides?: ActionParamOverrides): unknown[];
//# sourceMappingURL=param-validation.d.ts.map