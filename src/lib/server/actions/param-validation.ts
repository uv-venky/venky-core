/* Copyright (c) 2024-present Venky Corp. */

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
import { UserError } from '@/lib/core/common/error';
import type { ActionParamSchemaEntry } from './registry-context';
import { ACTION_PARAM_OVERRIDES, type ActionParamOverrides } from './param-schemas.overrides';

function zodForEntry(action: string, entry: ActionParamSchemaEntry, overrides: ActionParamOverrides): z.ZodTypeAny {
  const override = overrides[action]?.[entry.name];
  let base: z.ZodTypeAny;
  if (override) {
    base = override;
  } else {
    switch (entry.type) {
      case 'string':
        base = z.string();
        break;
      case 'number':
        base = z.number();
        break;
      case 'boolean':
        base = z.boolean();
        break;
      default:
        // object → opaque pass-through; tighten via ACTION_PARAM_OVERRIDES.
        base = z.unknown();
        break;
    }
  }
  let schema = entry.nullable ? base.nullable() : base;
  if (entry.optional) {
    schema = schema.optional();
  }
  return schema;
}

/** Build a zod tuple validator for an action's positional params. */
export function buildActionParamValidator(
  action: string,
  entries: ActionParamSchemaEntry[],
  overrides: ActionParamOverrides = ACTION_PARAM_OVERRIDES,
): z.ZodType<unknown[]> {
  const items = entries.map((entry) => zodForEntry(action, entry, overrides));
  // z.tuple([]) is valid at runtime and rejects any extra args; the cast lets us
  // pass a (possibly empty) array to the variadic tuple overload.
  return z.tuple(items as unknown as [z.ZodTypeAny, ...z.ZodTypeAny[]]) as unknown as z.ZodType<unknown[]>;
}

/**
 * Validate an action's args against its param schema. Returns the parsed args
 * on success; throws {@link UserError} on any mismatch.
 */
export function validateActionParams(
  action: string,
  entries: ActionParamSchemaEntry[],
  args: unknown[],
  overrides: ActionParamOverrides = ACTION_PARAM_OVERRIDES,
): unknown[] {
  const validator = buildActionParamValidator(action, entries, overrides);
  const result = validator.safeParse(args);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `arg[${issue.path.join('.') || '?'}]: ${issue.message}`)
      .join('; ');
    throw new UserError(`Invalid parameters for action ${action}: ${detail}`);
  }
  return result.data;
}
