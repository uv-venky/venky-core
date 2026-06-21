'use server';
import { withDBSessionAction } from '../../../lib/core/server/withDBActions';
import { normalizePgTypeBase } from './utils';
// Function to check if a type allows decimals
function allowsDecimals(pgType) {
  const { base } = normalizePgTypeBase(pgType);
  return ['numeric', 'double precision', 'real'].includes(base);
}
// Function to check if a type includes time
function includesTime(pgType) {
  const { base } = normalizePgTypeBase(pgType);
  return ['timestamp with time zone', 'timestamp without time zone'].includes(base);
}
export const genColumns = withDBSessionAction(async (client, _session, tableName, schemaName) => {
  // Use pg_attribute OIDs for data_type — format_type((udt_name)::regtype, ...) fails for
  // types like pgvector's `vector` when the name-only cast cannot resolve the type.
  let query = `
    SELECT 
      c.column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
      c.character_maximum_length,
      c.is_nullable,
      c.numeric_precision,
      c.numeric_scale
    FROM information_schema.columns c
    INNER JOIN pg_catalog.pg_namespace pn ON pn.nspname = c.table_schema
    INNER JOIN pg_catalog.pg_class pc ON pc.relnamespace = pn.oid AND pc.relname = c.table_name
      AND pc.relkind IN ('r', 'p', 'v', 'm', 'f')
    INNER JOIN pg_catalog.pg_attribute a ON a.attrelid = pc.oid AND a.attname = c.column_name
      AND a.attnum > 0 AND NOT a.attisdropped
    WHERE c.table_name = $1`;
  let query2 = `
    union all
	  SELECT 
      a.attname AS column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
      100 AS character_maximum_length,
      'YES' AS is_nullable,
      0 AS numeric_precision,
      0 AS numeric_scale
  FROM pg_attribute a
  JOIN pg_class c ON a.attrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  JOIN pg_matviews m on m.schemaname =n.nspname and c.relname =m.matviewname
  WHERE c.relname = $1
    AND a.attnum > 0
    AND NOT a.attisdropped
  `;
  const params = [tableName];
  if (schemaName !== 'default') {
    query += ' AND c.table_schema = $2';
    query2 += ' AND n.nspname = $2';
    params.push(schemaName);
  } else {
    query += ' AND c.table_schema = current_schema()';
    query2 += ' AND n.nspname = current_schema()';
  }
  const res = await client.query(query + query2, params);
  return res.rows
    .map((row) => {
      const { base } = normalizePgTypeBase(row.data_type);
      return {
        name: row.column_name,
        type: row.data_type,
        maxLength: row.character_maximum_length,
        nullable: row.is_nullable === 'YES',
        allowDecimals: allowsDecimals(row.data_type) && (row.numeric_scale > 0 || base !== 'numeric'),
        excludeTime: !includesTime(row.data_type),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});
export const getTableNames = withDBSessionAction(async (client, _session, filter) => {
  const query = `select table_schema, table_name, table_type from information_schema.tables
where table_schema not in ('pg_catalog', 'information_schema') AND table_name like $1
union all
select schemaname,matviewname,'MV' as table_Type from pg_matviews
where  matviewname like $1
order by 2
LIMIT 50
`;
  const params = [`${filter}%`];
  const res = await client.query(query, params);
  return res.rows;
});
//# sourceMappingURL=action.js.map
