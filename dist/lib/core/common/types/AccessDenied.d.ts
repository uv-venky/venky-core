/**
 * The kind of resource an authorization gate was protecting when it denied
 * access. Used by `logAccessDenied` (see `@/lib/core/server/activity`) to tag
 * 'Access Denied' audit rows.
 *
 * Lives in a plain (non-`'use server'`) module so the const value can be
 * imported by both the server logging helper and the various rejection sites
 * — a `'use server'` file may only export async functions.
 */
export declare const AccessDeniedResourceType: {
    readonly Domain: "domain";
    readonly Agent: "agent";
    readonly Action: "action";
    readonly DataSourceQuery: "datasource:query";
    readonly DataSourceInsert: "datasource:insert";
    readonly DataSourceUpdate: "datasource:update";
    readonly DataSourceDelete: "datasource:delete";
};
export type AccessDeniedResourceType = (typeof AccessDeniedResourceType)[keyof typeof AccessDeniedResourceType];
//# sourceMappingURL=AccessDenied.d.ts.map