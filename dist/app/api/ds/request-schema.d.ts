import type { Query, Row } from '../../../lib/core/common/ds/types/filter';
export interface DsRequestPayload {
    ds: string;
    query?: Query<any>;
    rows?: Row<any>[];
    debug?: boolean;
}
/** Parse + validate the request envelope. Throws {@link UserError} on any unknown/invalid top-level field. */
export declare function parseDsRequest(raw: unknown): DsRequestPayload;
/**
 * Validate a client `query`: reject server-only raw-SQL fields (specific
 * message), then validate the top-level props with {@link QuerySchema} (unknown
 * props and statically-typed mismatches throw {@link UserError}). Throws on any
 * violation; returns nothing.
 */
export declare function validateQuery(query: unknown): void;
//# sourceMappingURL=request-schema.d.ts.map