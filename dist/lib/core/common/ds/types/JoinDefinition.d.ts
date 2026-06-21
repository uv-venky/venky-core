/**
 * Definition for a table join in a DataSource.
 * Joins are defined centrally in the `joins` array of a DataSource.
 */
export interface JoinDefinition {
    /**
     * Alias for the joined table (e.g., 'cust', 'pm', 'custType').
     * This alias is used in attribute definitions via `joinAlias`.
     */
    alias: string;
    /**
     * Name of the table to join.
     */
    tableName: string;
    /**
     * Type of join to perform.
     */
    joinType: 'INNER' | 'LEFT';
    /**
     * SQL join condition (ON clause).
     * Can be a string or a function that returns a string.
     * Use 'x' to reference the main table.
     * Use other join aliases to reference previously joined tables (for nested joins).
     *
     * @example
     * // Join to main table
     * on: 'cust.customer_id = x.customer_id'
     *
     * @example
     * // Nested join (depends on 'cust' alias)
     * on: 'custType.id = cust.type_id'
     */
    on: string | (() => string);
    /**
     * Explicit parent alias for nested joins.
     * If this join depends on another join, specify the parent alias here.
     * This replaces regex-based dependency detection.
     *
     * @example
     * // If this join depends on 'cust' join
     * dependsOn: 'cust'
     */
    dependsOn?: string;
    /**
     * Optional description/documentation for this join.
     */
    description?: string;
}
//# sourceMappingURL=JoinDefinition.d.ts.map