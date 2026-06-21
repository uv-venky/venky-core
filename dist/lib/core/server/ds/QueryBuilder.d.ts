import type { DBType } from '../../../../lib/core/common/ds/types/DBType';
import type { DataSource } from '../../../../lib/core/common/ds/types/DataSource';
import { type Query } from '../../../../lib/core/common/ds/types/filter';
import type { Session } from '../../../../auth';
export declare enum DateExtraTypes {
    DayOfMonth = "DayOfMonth",
    DayOfWeek = "DayOfWeek",
    DayOfYear = "DayOfYear",
    Month = "Month",
    Quarter = "Quarter",
    Year = "Year"
}
export declare class QueryBuilder<T extends object> {
    private dbType;
    private dataSource;
    private fetchDistinct;
    private fromClause;
    private fullSql;
    private fullCountSql;
    private groupByClause;
    private havingClause;
    private limit;
    private offset;
    private orderBy;
    private params;
    private countParams;
    private countOnly;
    private selectAttributes;
    private selectClause;
    skipPagination: boolean;
    private whereClause;
    private aliasQuoteChar;
    private columnQuoteChar;
    private selectedRefAliases;
    private treeOptions?;
    private parentRow?;
    private session;
    constructor(dataSource: DataSource<T>, session: Session, dbType?: DBType);
    /**
     * Validates that old and new join formats are not mixed.
     * Rules:
     * - If `joins` array exists: attributes referencing joins must use `joinAlias` (not `refAlias`)
     * - If `joins` array exists: Reference attributes should not have `refTableName`/`refWhereClause` (join defs are in array)
     * - If `joins` array exists: `joinAlias` values must reference valid join definitions
     * - If no `joins` array: attributes should not use `joinAlias` (would be invalid)
     */
    private validateJoinFormatConsistency;
    private build;
    private buildForCount;
    getQuery(): string;
    getCountQuery(): string;
    getParams(): unknown[];
    getCountParams(): unknown[];
    applyQuery(query: Query<T>): void;
    /**
     * Validates that old format joins only reference the main table (no nested joins).
     * Throws an error if nested joins are detected, directing users to use the new joins array format.
     */
    private validateOldFormatJoins;
    /**
     * Returns the dependencies for a join definition — either the explicit `dependsOn` field,
     * or inferred from the ON clause by detecting references to other join aliases.
     */
    private getJoinDependencies;
    /**
     * Expands a list of aliases to include all transitive dependencies (new format with joins array).
     * If alias A depends on alias B, and A is in the list, B will also be added.
     * Dependencies are resolved from the explicit `dependsOn` field or inferred from ON clauses.
     */
    private expandAliasesWithDependenciesNewFormat;
    /**
     * Builds a dependency graph for joins (new format) and returns them in topological order.
     * Uses explicit `dependsOn` field instead of regex parsing.
     */
    private getSortedJoinsNewFormat;
    /**
     * Expands a list of aliases to include all transitive dependencies (old format).
     * If alias A depends on alias B, and A is in the list, B will also be added.
     * Only supports simple joins to main table.
     */
    private expandAliasesWithDependencies;
    /**
     * Extracts referenced aliases from a refWhereClause string.
     * Looks for patterns like "alias.column" to identify dependencies.
     * Returns an array of aliases that this join depends on (excluding 'x' which is the main table).
     * @param refWhereClause - The WHERE clause for the join
     * @param availableAliases - Set of all available aliases
     * @param currentAlias - The alias for which we're extracting dependencies (to exclude self-references)
     */
    private extractReferencedAliases;
    /**
     * Builds a dependency graph for joins and returns them in topological order.
     * Ensures that joins that depend on other joins are added after their dependencies.
     */
    private getSortedJoins;
    private appendOrderByClause;
    private appendDateValueToWhereClause;
    private appendNumberValueToWhereClause;
    private appendBooleanValueToWhereClause;
    private appendStringValueToWhereClause;
    private appendUUIDValueToWhereClause;
    private appendPolygonValueToWhereClause;
    private appendToWhereClause;
    private appendAggregateFunctionToSelectClause;
    private getAggregateFunctionForOrderBy;
    /**
     * Build ORDER BY expression for sorting by a key inside a JSON/JSONB column.
     * Used when query.sort contains a dotted key like "attributes.key".
     */
    private buildOrderByJsonKey;
    private appendColumnNameToGroupByClause;
    private addCombinerToWhereClause;
    private appendColumnNameToWhereClause;
    /**
     * Appends column reference or JSONB key expression to WHERE clause.
     * When jsonKey is set, appends e.g. x."attributes"->>'key' (Postgres).
     * When cast is set with jsonKey, wraps expression for number/boolean/date comparison (e.g. (expr)::numeric).
     */
    private appendColumnOrJsonKeyToWhereClause;
    /**
     * Appends UPPER(column) or UPPER(column->>'key') to WHERE clause for case-insensitive comparison.
     */
    private appendColumnOrJsonKeyUpperToWhereClause;
    private getJsonKeyColumnExpression;
    private bindVar;
    private appendSqlUpperToWhereClause;
    private addStringFilterToWhereClause;
    private addUUIDFilterToWhereClause;
    private addMultiUUIDFilterToWhereClause;
    private addFilterToWhereClause;
    private addMultiDateFilterToWhereClause;
    private addDateParam;
    private betweenDates;
    private lastNDays;
    private nextNDays;
    private addDateFilterToWhereClause;
    private addMultiNumberFilterToWhereClause;
    private addBoolFilterToWhereClause;
    private addYNFilterToWhereClause;
    private addTFFilterToWhereClause;
    private addNumberFilterToWhereClause;
    private addMultiStringFilterToWhereClause;
    private addTextArrayFilterToWhereClause;
    private appendAnd;
    private appendColumnName;
    private appendColumnNameToSelectClause;
    /**
     * Appends a JSONB key extraction to the select clause (e.g. x."attributes"->>'key' AS "attributes.key").
     * Used when query.select contains a dotted key like "attributes.key".
     */
    private appendJsonKeyToSelectClause;
    private validateSqlFragment;
    private parseSql;
    private getDateExtraType;
    private getExtraDateColumnName;
    private isDateFilter;
    private isStringFilter;
    private isNumberFilter;
    private isBooleanFilter;
    private isYNFilter;
    private isTFFilter;
    private isMultiStringFilter;
    private isTextArrayFilter;
    private isMultiNumberFilter;
    private isMultiDateFilter;
    private isUUIDFilter;
    private isMultiUUIDFilter;
}
//# sourceMappingURL=QueryBuilder.d.ts.map