/**
 * Opt-in precise validation for server-action params.
 *
 * The generated `ACTION_PARAM_SCHEMAS` only knows loose types
 * (`string`/`number`/`boolean`/`object`). Object params therefore validate as
 * pass-through (`z.unknown()`) by default — safe, but unenforced. To tighten a
 * specific param, add a precise zod schema here keyed by
 * `[actionName][paramName]`. The override replaces the generated base type for
 * that one positional param.
 *
 * Optionality is layered on top from the generated metadata: if a param is
 * flagged `optional` (trailing `?` / `| undefined`), the validator appends
 * `.optional()` to the override automatically — so provide the *base* type here
 * (e.g. `z.string()`, not `z.string().optional()`) for those. Use `.nullable()`
 * explicitly for params whose type includes `null`.
 *
 * Destructured object params are named `__2` by the codegen (it can't recover
 * the original name); key the override with `__2` to match.
 *
 * `z.object(...)` strips unknown keys rather than erroring, so adding a field to
 * an action's param later will not retroactively reject callers — but a wrong
 * *required* field here rejects legitimate traffic, so only tighten shapes that
 * are known and stable.
 *
 * Intentionally left pass-through (too large / nested / evolving / `any`):
 *   createComment.comment      — Partial<Comment> with nested attachments
 *   updateProfile.value         — UserSettings[K], a broad value union
 */
import { z } from 'zod';
export type ActionParamOverrides = Record<string, Record<string, z.ZodTypeAny>>;
export declare const ACTION_PARAM_OVERRIDES: ActionParamOverrides;
//# sourceMappingURL=param-schemas.overrides.d.ts.map
