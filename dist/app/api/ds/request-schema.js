/* Copyright (c) 2024-present Venky Corp. */
/**
 * Strict envelope validation for the `/api/ds` request body.
 *
 * Only the four known top-level fields are accepted; any unknown field is
 * rejected (`.strict()`). The `query`/`rows` *contents* are intentionally left
 * unvalidated here — rows are checked at runtime against the DataSource's
 * attributes and unknown row keys are safely ignored, and `query` is further
 * screened by the server-only-field guard in the route.
 */
import { z } from 'zod';
import { UserError } from '../../../lib/core/common/error';
const DsRequestSchema = z
  .object({
    ds: z.string(),
    query: z.unknown().optional(),
    rows: z.array(z.unknown()).optional(),
    debug: z.boolean().optional(),
  })
  .strict();
/** Parse + validate the request envelope. Throws {@link UserError} on any unknown/invalid top-level field. */
export function parseDsRequest(raw) {
  const result = DsRequestSchema.safeParse(raw);
  if (!result.success) {
    const unknownKeys = result.error.issues.flatMap((issue) => (issue.code === 'unrecognized_keys' ? issue.keys : []));
    if (unknownKeys.length > 0) {
      throw new UserError(`Invalid request: unknown field(s): ${unknownKeys.join(', ')}`);
    }
    throw new UserError('Invalid request body');
  }
  return result.data;
}
// Raw-SQL query facilities are server-only: they are interpolated into SQL with no
// (or only denylist) validation and must never be accepted from the HTTP client.
// Server code builds these inside `preQuery`/actions; legitimate clients use the
// parameterized `filters`/`match`/`sort` fields instead.
const SERVER_ONLY_QUERY_FIELDS = [
  'fullSQL',
  'whereClause',
  'whereClauseParamList',
  'subSQL',
  'subSQLParamList',
  'fromClause',
  'orderBy',
];
/**
 * Strict schema over the client-facing top-level `Query` props. Props whose
 * type is statically knowable (independent of the DataSource row type `T`) are
 * typed precisely; `T`-dependent props are accepted loosely (the row layer and
 * SQL builder validate their contents). Server-only raw-SQL fields are excluded
 * and rejected up front by {@link assertNoServerOnlyQueryFields}.
 */
const QuerySchema = z
  .object({
    // statically typed — scalars
    fetchDistinct: z.boolean().optional(),
    countOnly: z.boolean().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    // statically typed — key lists (StringKeyof<T>[] -> string[])
    groupBy: z.array(z.string()).optional(),
    select: z.array(z.string()).optional(),
    // statically typed — key -> number maps (SchemaMember<T, number>)
    projection: z.record(z.string(), z.number()).optional(),
    sort: z.record(z.string(), z.number()).optional(),
    // T-dependent values — key -> unknown maps (SchemaMemberValue<T>)
    match: z.record(z.string(), z.unknown()).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    params: z.record(z.string(), z.unknown()).optional(),
    // T-dependent element shapes — arrays
    aggregate: z.array(z.unknown()).optional(),
    filters: z.array(z.unknown()).optional(),
    filter: z.array(z.unknown()).optional(),
    // fully T-dependent — not statically typeable
    parentRow: z.unknown().optional(),
    treeOptions: z.unknown().optional(),
  })
  .strict();
function assertNoServerOnlyQueryFields(query) {
  for (const field of SERVER_ONLY_QUERY_FIELDS) {
    if (query[field] != null) {
      throw new UserError(`Query field '${field}' is not allowed in client queries`);
    }
  }
}
/**
 * Validate a client `query`: reject server-only raw-SQL fields (specific
 * message), then validate the top-level props with {@link QuerySchema} (unknown
 * props and statically-typed mismatches throw {@link UserError}). Throws on any
 * violation; returns nothing.
 */
export function validateQuery(query) {
  if (query != null && typeof query === 'object' && !Array.isArray(query)) {
    assertNoServerOnlyQueryFields(query);
  }
  const result = QuerySchema.safeParse(query);
  if (!result.success) {
    const unknownKeys = result.error.issues.flatMap((issue) => (issue.code === 'unrecognized_keys' ? issue.keys : []));
    if (unknownKeys.length > 0) {
      throw new UserError(`Invalid query: unknown field(s): ${unknownKeys.join(', ')}`);
    }
    const detail = result.error.issues.map((issue) => `${issue.path.join('.') || '?'}: ${issue.message}`).join('; ');
    throw new UserError(`Invalid query: ${detail}`);
  }
}
//# sourceMappingURL=request-schema.js.map
