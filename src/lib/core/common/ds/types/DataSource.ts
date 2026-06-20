import type { Session } from '@/auth';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { DataSourceAccess } from '@/lib/core/common/ds/types/DataSourceAccess';
import type { DBRow, Query, Row } from '@/lib/core/common/ds/types/filter';
import type { PgPoolClient } from '@/lib/core/server/db';
import type { JoinDefinition } from '@/lib/core/common/ds/types/JoinDefinition';

export type { ISODateString, ISOTimeString, ISODateTimeString } from '@/lib/core/common/ds/types/Base';

type BaseDataSource<T extends object> = {
  type: 'Table' | 'External';
  id: string;
  description?: string;
  cached?: boolean;
  logLevel?: string;
  skipQueryForUpdate?: boolean;
  readOnly?: boolean;
  attributes: Array<Attribute<T>>;
  /**
   * Centralized join definitions.
   * Joins can be defined here instead of scattered across Reference attributes.
   * When present, this takes precedence over attribute-based join discovery.
   *
   * @example
   * joins: [
   *   {
   *     alias: 'cust',
   *     tableName: 'customers',
   *     joinType: 'INNER',
   *     on: 'cust.customer_id = x.customer_id',
   *   },
   *   {
   *     alias: 'custType',
   *     tableName: 'customer_types',
   *     joinType: 'LEFT',
   *     on: 'custType.id = cust.type_id',
   *     dependsOn: 'cust',  // Explicit dependency for nested joins
   *   },
   * ]
   */
  joins?: Array<JoinDefinition>;
  bulkInsertChunkSize?: number;
  access: Array<DataSourceAccess>;
  publishSSE?: boolean;
  /**
   * Hook executed before query execution to modify the query object.
   * This allows for dynamic query manipulation at the application level.
   *
   * @param props - The properties object containing query details
   * @param props.query - The original query object to be modified
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the modified query object
   */
  preQuery?: (props: { query: Query<T>; session: Session; client: PgPoolClient }) => Promise<Query<T>>;
  /**
   * This hook is executed after the preQuery hook and before the query is executed.
   * It allows for dynamic query manipulation at the SQL level.
   * Use this hook to add dynamic filters, joins, or other SQL modifications.
   *
   * @example
   * ```typescript
   * preQuery2: ({ query, sql, params, session, client }) => {
   *   const planId = query.match?.planId;
   *   if (planId) {
   *     params.push(planId);
   *     sql = sql.replace('UNION ALL', ` AND x.plan_id = $${params.length} UNION ALL`);
   *   }
   *   return { sql, params };
   * },
   * ```
   * @param props - The properties object containing query details
   * @param props.query - The original query object
   * @param props.sql - The SQL query string to be executed
   * @param props.params - Array of parameters to be used in the SQL query
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Object containing the modified SQL query and parameters
   */
  preQuery2?: (props: { query: Query<T>; sql: string; params: any[]; session: Session; client: PgPoolClient }) => {
    sql: string;
    params: any[];
  };
  /**
   * Hook executed before updating rows in the database.
   * Allows for validation and modification of data before the update operation.
   *
   * @param props - The properties object containing update details
   * @param props.rows - Array of rows to be updated
   * @param props.previousRows - Row state from the DB before the update, same order as rows; undefined when current rows were not loaded (e.g. skipQueryForUpdate or no rows)
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to an object containing the modified rows and an optional skipDML flag
   */
  beforeUpdate?: (props: {
    rows: DBRow<T>[];
    previousRows?: DBRow<T>[];
    session: Session;
    client: PgPoolClient;
  }) => Promise<{ rows: DBRow<T>[]; skipDML?: boolean }>;
  /**
   * Hook executed before inserting rows into the database.
   * Allows for validation and modification of data before the insert operation.
   *
   * @param props - The properties object containing insert details
   * @param props.rows - Array of rows to be inserted
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to an object containing the modified rows and an optional skipDML flag
   */
  beforeInsert?: (props: {
    rows: DBRow<T>[];
    session: Session;
    client: PgPoolClient;
  }) => Promise<{ rows: DBRow<T>[]; skipDML?: boolean }>;
  /**
   * Hook executed before deleting rows from the database.
   * Allows for validation and modification of the delete operation.
   *
   * @param props - The properties object containing delete details
   * @param props.rows - Array of rows to be deleted
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the modified array of rows to be deleted
   */
  beforeDelete?: (props: { rows: DBRow<T>[]; session: Session; client: PgPoolClient }) => Promise<DBRow<T>[]>;
  /**
   * Hook executed after inserting rows into the database.
   * Allows for post-processing of inserted data.
   *
   * @param props - The properties object containing insert details
   * @param props.rows - Array of rows that were inserted
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the modified array of inserted rows
   */
  afterInsert?: (props: { rows: DBRow<T>[]; session: Session; client: PgPoolClient }) => Promise<DBRow<T>[]>;
  /**
   * Hook executed after deleting rows from the database.
   * Allows for post-processing of deleted data.
   *
   * @param props - The properties object containing delete details
   * @param props.rows - Array of rows that were deleted
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the modified array of deleted rows
   */
  afterDelete?: (props: { rows: DBRow<T>[]; session: Session; client: PgPoolClient }) => Promise<DBRow<T>[]>;
  /**
   * Hook executed after updating rows in the database.
   * Allows for post-processing of updated data.
   *
   * @param props - The properties object containing update details
   * @param props.rows - Array of rows that were updated
   * @param props.previousRows - Row state from the DB before the update, same order as rows; undefined when current rows were not loaded (e.g. skipQueryForUpdate or no rows)
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the modified array of updated rows
   */
  afterUpdate?: (props: {
    rows: DBRow<T>[];
    previousRows?: DBRow<T>[];
    session: Session;
    client: PgPoolClient;
  }) => Promise<DBRow<T>[]>;
  /**
   * Hook executed after query execution to process the results.
   * Allows for post-processing of query results before they are returned.
   *
   * @param props - The properties object containing query details
   * @param props.query - The original query object
   * @param props.rows - Array of rows returned by the query
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the modified array of query results
   */
  postQuery?: (props: {
    query: Query<T>;
    rows: DBRow<T>[];
    session: Session;
    client: PgPoolClient;
  }) => Promise<DBRow<T>[]>;
  /**
   * Hook for validating a single row of data.
   * Allows for custom validation logic to be applied to individual rows.
   *
   * @param props - The properties object containing validation details
   * @param props.row - The row to be validated
   * @param props.session - The current user session
   * @param props.client - The PostgreSQL client instance
   * @returns Promise resolving to the validated row
   */
  validateOne?: (props: { row: Row<T>; session: Session; client: PgPoolClient }) => Promise<Row<T>>;
  rowType: T[];
  getSelectableAttributes?: (session: Session) => Array<Attribute<T>>;
};

export type TableDataSource<T extends object> = BaseDataSource<T> & {
  type: 'Table';
  tableName: string;
  schema?: string;
};

export type ExternalDataSource<T extends object> = BaseDataSource<T> & {
  type: 'External';
  externalType: string;
  externalId: string;
};

export type DataSource<T extends object> = TableDataSource<T> | ExternalDataSource<T>;
