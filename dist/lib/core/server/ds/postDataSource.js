/* Copyright (c) 2024-present Venky Corp. */
import logger from '../../../../lib/core/server/logger';
import { parseISO } from 'date-fns';
import { hasAccess } from '../../../../lib/core/server/ds/hasAccess';
import { getErrorMessage, UserError } from '../../../../lib/core/common/error';
import {
  coordinatesToPolygonString,
  validatePolygonCoordinates,
  ensurePolygonClosed,
} from '../../../../lib/core/common/ds/types/polygon-utils';
import { getDataSource } from '../../../../lib/server/ds/defs/ds';
import { logAccessDenied, logActivity } from '../../../../lib/core/server/activity';
import { AccessDeniedResourceType } from '../../../../lib/core/common/types/AccessDenied';
import { deepEqual } from '../../../../components/core/utils';
import { publishSSE } from '../../../../lib/sse/server/publisher';
import {
  applyAuditValueToRow,
  classifyUpdateAttributes,
  getPkValueStr,
  getWhoAttributes,
  loadCurrentRowsForUpdate,
  normalizeWhitespaceForPost,
  populateDefaultValues,
  populateWHOColumnsForUpdate,
  toIsoString,
  validateAttributeConstraintsForPost,
  validateRowForUpdateOrDelete,
  formatVectorForPostgres,
} from '../../../../lib/core/server/ds/dsUtils';
export async function postDataSource(client, session, ds, rows, options) {
  if (!rows?.length) {
    throw new UserError(`No rows to post for data source ${ds.id}`);
  }
  const start = Date.now();
  // Validate before post
  const { collect, result } = await validateBeforePost(client, session, ds, rows);
  if (result) {
    return result;
  }
  if (!collect) {
    throw new UserError('Both collect and result cannot be None!');
  }
  // Group by and post
  const collect3 = await groupByAndPost(client, session, ds, collect);
  const elapsed = Date.now() - start;
  // Use string eventId only (ds can be wrong if postDataSource was called with wrong arg order)
  const dsId = typeof ds?.id === 'string' ? ds.id : 'unknown';
  await logActivity({
    userName: session.user.userName,
    eventType: 'Post',
    eventId: dsId,
    metadata: {
      inserts: collect.filter((row) => row._status === 'I').length,
      updates: collect.filter((row) => row._status === 'U').length,
      deletes: collect.filter((row) => row._status === 'D').length,
    },
    rowCount: collect.length,
    dataSource: dsId,
    elapsedTimeMs: elapsed,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  });
  // Update record status
  for (const row of collect3) {
    // @ts-expect-error row._status can be I
    if (row._status === 'I' || row._status === 'U') {
      row._status = 'Q';
    }
  }
  // Publish SSE event for autoRefresh stores (cross-tab/cross-user)
  if (ds.publishSSE && !options?.skipSSE) {
    // Track operation types for SSE action
    const hasInserts = collect.some((row) => row._status === 'I');
    const hasUpdates = collect.some((row) => row._status === 'U');
    const hasDeletes = collect.some((row) => row._status === 'D');
    const action =
      (hasInserts && hasUpdates) || (hasInserts && hasDeletes) || (hasUpdates && hasDeletes)
        ? 'mixed'
        : hasInserts
          ? 'insert'
          : hasUpdates
            ? 'update'
            : 'delete';
    await publishSSE(client, `data:${ds.id}`, {
      action,
      id: ds.id,
      sourceTrackId: options?.sourceTrackId,
    });
  }
  // let sql: string | undefined;
  // let params: Values | undefined;
  // if (collect3.length > 0) {
  //   sql = collect3[0].sql;
  //   params = collect3[0].params;
  // }
  return { rows: collect3, elapsed };
}
async function validateBeforePost(_client, _session, ds, rows) {
  normalizeWhitespaceForPost(ds, rows);
  validateAttributeConstraintsForPost(ds, rows);
  return { collect: rows };
}
async function groupByAndPost(client, session, ds, rows) {
  const deletedRows = [];
  const insertedRows = [];
  const updatedRows = [];
  const collect = [];
  for (const row of rows) {
    switch (row._status) {
      case 'D':
        if (!(await hasAccess(ds, session, 'Delete'))) {
          await logAccessDenied({
            userName: session.user.userName,
            roles: session.user.roles,
            sessionId: session.id,
            resourceType: AccessDeniedResourceType.DataSourceDelete,
            resource: ds.id,
            reason: `Delete denied for data source ${ds.id}`,
          });
          throw new UserError(`Access denied! Delete denied for data source ${ds.id}`);
        }
        deletedRows.push(row);
        break;
      case 'I':
        if (!(await hasAccess(ds, session, 'Insert'))) {
          await logAccessDenied({
            userName: session.user.userName,
            roles: session.user.roles,
            sessionId: session.id,
            resourceType: AccessDeniedResourceType.DataSourceInsert,
            resource: ds.id,
            reason: `Insert denied for data source ${ds.id}`,
          });
          throw new UserError(`Access denied! Insert denied for data source ${ds.id}`);
        }
        insertedRows.push(row);
        break;
      case 'U':
        if (!(await hasAccess(ds, session, 'Update'))) {
          await logAccessDenied({
            userName: session.user.userName,
            roles: session.user.roles,
            sessionId: session.id,
            resourceType: AccessDeniedResourceType.DataSourceUpdate,
            resource: ds.id,
            reason: `Update denied for data source ${ds.id}`,
          });
          throw new UserError(`Access denied! Update denied for data source ${ds.id}`);
        }
        updatedRows.push(row);
        break;
      default:
        throw new UserError(`Invalid record status '${row._status}' passed to post!`);
    }
  }
  if (insertedRows.length > 0) {
    const inserted = [];
    const chunkSize = ds.bulkInsertChunkSize ?? 100;
    for (let i = 0; i < insertedRows.length; i += chunkSize) {
      const chunk = insertedRows.slice(i, i + chunkSize);
      chunk[0]._chunkIndex = i;
      const chunkResult = await insertMany(client, session, ds, chunk);
      inserted.push(...chunkResult);
    }
    // const inserted = await insertMany(client, session, ds, insertedRows);
    collect.push(...inserted);
  }
  if (updatedRows.length > 0) {
    const updated = await updateMany(client, session, ds, updatedRows);
    collect.push(...updated);
  }
  if (deletedRows.length > 0) {
    const deleted = await deleteMany(client, session, ds, deletedRows);
    collect.push(...deleted);
  }
  return collect;
}
async function insertMany(client, session, ds, insertedRows) {
  if (ds.readOnly) {
    throw new UserError('Data source is read only!');
  }
  let rows = insertedRows;
  await populateDefaultValues(client, session, ds, rows);
  if (ds.beforeInsert) {
    const { rows: insertedRows, skipDML } = await ds.beforeInsert({
      rows,
      session,
      client,
    });
    if (skipDML) {
      return insertedRows.map((row) => ({
        ...row,
        _status: 'Q',
      }));
    }
    rows = insertedRows;
  }
  if (ds.type === 'Table') {
    const returningColumns = [];
    const insertColumns = [];
    for (const attr of ds.attributes) {
      const column = attr.column;
      if (column == null || attr.calculated || (!attr.insert && !attr.select)) {
        continue;
      }
      if (attr.auto || !attr.insert) {
        returningColumns.push(column);
        continue;
      }
      if (column === column.toLowerCase()) {
        insertColumns.push(column);
      } else {
        insertColumns.push(`"${column}"`);
      }
    }
    const params = [];
    let counter = 0;
    const binds = [];
    for (const row of rows) {
      const rowBinds = [];
      for (const attr of ds.attributes) {
        if (attr.column == null || attr.calculated || attr.auto || !attr.insert) {
          continue;
        }
        let typeCast = '';
        if (attr.type === 'Date') {
          if (attr.excludeTime) {
            typeCast = '::DATE';
          } else {
            typeCast = '::TIMESTAMPTZ';
          }
        } else if (attr.type === 'Time') {
          typeCast = '::TIME';
        } else if (attr.type === 'Number') {
          if (attr.isBigInt) {
            typeCast = '::bigint';
          }
          typeCast = attr.allowDecimals ? '::numeric' : '::integer';
        } else if (attr.type === 'Boolean') {
          typeCast = '::boolean';
        } else if (attr.type === 'JSON') {
          typeCast = '::jsonb';
        } else if (attr.type === 'UUID') {
          typeCast = '::uuid';
        } else if (attr.type === 'TextArray') {
          typeCast = '::varchar[]';
        } else if (attr.type === 'Vector') {
          typeCast = '::vector';
        }
        rowBinds.push(`$${++counter}${typeCast}`);
        let val = row[attr.code];
        if (attr.type === 'Date' && val != null) {
          if (typeof val === 'string') {
            try {
              val = parseISO(val);
            } catch (error) {
              logger.error('Failed to parse date string:', val, error);
              throw new UserError(`Failed to parse date string: ${val}`);
            }
          } else if (!(val instanceof Date)) {
            logger.error('Expected a string or Date object, received:', typeof val);
            throw new UserError(`Expected a string or Date object, received: ${typeof val}`);
          }
        }
        if (val != null && attr.type === 'JSON') {
          val = JSON.stringify(val);
        }
        if (val != null && attr.type === 'Vector') {
          val = formatVectorForPostgres(val);
        }
        params.push(val);
      }
      binds.push(`(${rowBinds.join(', ')})`);
    }
    let sql = `INSERT INTO ${ds.schema ? `${ds.schema}.` : ''}${ds.tableName} (${insertColumns.join(', ')}) VALUES ${binds.join(', ')}`;
    if (returningColumns.length > 0) {
      sql += ` RETURNING ${returningColumns.join(', ')}`;
    }
    let result;
    try {
      if (params.length > 32767) {
        throw new UserError('Params length is greater than 32767!');
      }
      result = await client.query(sql, params);
    } catch (e) {
      logger.error(getErrorMessage(e));
      logger.error('sql: ', sql);
      if (params.length < 20) {
        logger.error(`params: ${JSON.stringify(params)}`);
      } else {
        logger.error(`params: ${JSON.stringify(params.slice(0, 20))}...${params.length - 20} more`);
      }
      throw e;
    }
    const len = rows.length;
    let returnRows = [];
    for (let i = 0; i < len; i++) {
      const row = rows[i];
      row._status = 'Q';
      const resultRow = result.rows[i];
      for (const attr of ds.attributes) {
        const column = attr.column;
        if (!attr.auto || column == null) {
          continue;
        }
        // @ts-expect-error column is valid in resultRow
        row[attr.code] = resultRow[column];
      }
      returnRows.push(row);
    }
    if (ds.afterInsert) {
      returnRows = await ds.afterInsert({ rows: returnRows, session, client });
    }
    return returnRows;
  }
  throw new UserError(`Unsupported data source type! ${ds.type}`);
}
async function updateMany(client, session, ds, _updatedRows) {
  let localUpdatedRows = _updatedRows;
  if (ds.readOnly) {
    throw new UserError('Data source is read only!');
  }
  // Check for $select metadata in first row to determine which attributes to include in SET clause
  const selectedAttributes = localUpdatedRows[0]?._$select;
  if (selectedAttributes) {
    delete localUpdatedRows[0]._$select;
  }
  const attributesInUpdate = selectedAttributes ? new Set(selectedAttributes) : null;
  const previousRows = await prepareForUpdate(client, session, ds, localUpdatedRows, attributesInUpdate);
  if (ds.beforeUpdate) {
    const { rows, skipDML } = await ds.beforeUpdate({
      rows: localUpdatedRows,
      previousRows,
      session,
      client,
    });
    if (skipDML) {
      return rows;
    }
    localUpdatedRows = rows;
  }
  populateWHOColumnsForUpdate(session, ds, localUpdatedRows);
  if (ds.type === 'Table') {
    const whereClause = [];
    const setClause = [];
    const updateColumns = [];
    const selectableAttributes = ds.getSelectableAttributes?.(session) ?? ds.attributes;
    for (const attr of selectableAttributes) {
      const column = attr.column;
      if (column == null || attr.calculated) {
        continue;
      }
      if (attr.primary) {
        if (!attr.select) {
          throw new UserError(`Primary attribute '${attr.code}' must be selectable!`);
        }
        if (column === column.toLowerCase()) {
          whereClause.push(`t.${column} = v.${column}`);
        } else {
          whereClause.push(`t."${column}" = v."${column}"`);
        }
      } else if (!attr.update || !attr.select) {
        continue;
      } else if (!attributesInUpdate || attributesInUpdate.has(attr.code)) {
        // Include if no $select (all attributes) or if in $select array
        if (column === column.toLowerCase()) {
          setClause.push(`${column} = v.${column}`);
        } else {
          setClause.push(`"${column}" = v."${column}"`);
        }
      }
      // Only add to updateColumns if it's in the SET clause (primary keys or selected attributes)
      if (attr.primary || !attributesInUpdate || attributesInUpdate.has(attr.code)) {
        if (column === column.toLowerCase()) {
          updateColumns.push(column);
        } else {
          updateColumns.push(`"${column}"`);
        }
      }
    }
    if (whereClause.length === 0) {
      throw new UserError(`No primary attributes found for update in data source ${ds.id}`);
    }
    const params = [];
    let counter = 0;
    const binds = [];
    for (const row of localUpdatedRows) {
      const rowBinds = [];
      for (const attr of selectableAttributes) {
        if (attr.column == null || attr.calculated || !attr.update) {
          continue;
        }
        // Skip if $select is present and this attribute is not in the selection
        if (attributesInUpdate && !attributesInUpdate.has(attr.code)) {
          continue;
        }
        let typeCast = '';
        if (attr.type === 'Date') {
          if (attr.excludeTime) {
            typeCast = '::DATE';
          } else {
            typeCast = '::TIMESTAMPTZ';
          }
        } else if (attr.type === 'Time') {
          typeCast = '::TIME';
        } else if (attr.type === 'Number') {
          if (attr.allowDecimals) {
            typeCast = '::numeric';
          } else if (attr.isBigInt) {
            typeCast = '::bigint';
          } else {
            typeCast = '::integer';
          }
        } else if (attr.type === 'Boolean') {
          typeCast = '::boolean';
        } else if (attr.type === 'JSON') {
          typeCast = '::jsonb';
        } else if (attr.type === 'UUID' || (attr.type === 'Reference' && attr.ref?.type === 'UUID')) {
          typeCast = '::uuid';
        } else if (attr.type === 'TextArray') {
          typeCast = '::varchar[]';
        } else if (attr.type === 'Polygon') {
          typeCast = '::polygon';
        } else if (attr.type === 'Vector') {
          typeCast = '::vector';
        }
        rowBinds.push(`$${++counter}${typeCast}`);
        let val = row[attr.code];
        if (attr.type === 'Date' && val != null) {
          if (typeof val === 'string') {
            try {
              val = parseISO(val);
            } catch (error) {
              logger.error('Failed to parse date string:', val, error);
              throw new UserError(`Failed to parse date string: ${val}`);
            }
          } else if (!(val instanceof Date)) {
            logger.error('Expected a string or Date object, received:', typeof val);
            throw new UserError(`Expected a string or Date object, received: ${typeof val}`);
          }
        }
        if (val != null && attr.type === 'JSON') {
          val = JSON.stringify(val);
        }
        if (val != null && attr.type === 'Polygon') {
          if (Array.isArray(val)) {
            // Validate and ensure closed polygon, then convert to polygon string
            const coordinates = ensurePolygonClosed(validatePolygonCoordinates(val));
            val = coordinatesToPolygonString(coordinates);
          } else {
            throw new UserError(
              `Invalid Request: Expected an array of coordinate pairs for attribute "${attr.name}", but found "${val}"`,
            );
          }
        }
        if (val != null && attr.type === 'Vector') {
          val = formatVectorForPostgres(val);
        }
        params.push(val);
      }
      binds.push(`(${rowBinds.join(', ')})`);
    }
    const sql = `UPDATE ${ds.schema ? `${ds.schema}.` : ''}${ds.tableName} AS t
      SET ${setClause.join(', ')}
      FROM (VALUES ${binds.join(', ')}) AS v(${updateColumns.join(', ')})
      WHERE ${whereClause.join(' AND ')}`;
    /* TODO
          WITH input_data AS (
      SELECT * FROM jsonb_to_recordset($1::jsonb) AS (
        created_by          INTEGER,
        creation_date       TIMESTAMPTZ,
        filters             JSONB,
        funding_ex          JSONB,
        impact_buy          TEXT,
        item_cost_type      JSONB,
        item_retail_type    JSONB,
        item_sell_type      JSONB,
        last_update_date    TIMESTAMPTZ,
        last_updated_by     INTEGER,
        margin              TEXT,
        order_in_dt_ex      JSONB,
        plan_id             TEXT,
        reflect_end_dt_ex   JSONB,
        reflect_rate_ex     JSONB,
        reflect_start_dt_ex JSONB,
        rule_id             INTEGER,
        type                TEXT,
        vendor_end_dt_ex    JSONB,
        vendor_rate_ex      JSONB,
        vendor_start_dt_ex  JSONB
      )
    )
    UPDATE plan_def_rules AS t
    SET
      created_by           = i.created_by,
      creation_date        = i.creation_date,
      filters              = i.filters,
      funding_ex           = i.funding_ex,
      impact_buy           = i.impact_buy,
      item_cost_type       = i.item_cost_type,
      item_retail_type     = i.item_retail_type,
      item_sell_type       = i.item_sell_type,
      last_update_date     = i.last_update_date,
      last_updated_by      = i.last_updated_by,
      margin               = i.margin,
      order_in_dt_ex       = i.order_in_dt_ex,
      plan_id              = i.plan_id,
      reflect_end_dt_ex    = i.reflect_end_dt_ex,
      reflect_rate_ex      = i.reflect_rate_ex,
      reflect_start_dt_ex  = i.reflect_start_dt_ex,
      type                 = i.type,
      vendor_end_dt_ex     = i.vendor_end_dt_ex,
      vendor_rate_ex       = i.vendor_rate_ex,
      vendor_start_dt_ex   = i.vendor_start_dt_ex
    FROM input_data i
    WHERE t.rule_id = i.rule_id;
    
          */
    try {
      await client.query(sql, params);
    } catch (e) {
      logger.error(getErrorMessage(e));
      logger.error('sql: ', sql);
      logger.error(`params: ${JSON.stringify(params)}`);
      throw e;
    }
    if (ds.afterUpdate) {
      localUpdatedRows = await ds.afterUpdate({
        rows: localUpdatedRows,
        previousRows,
        session,
        client,
      });
    }
    return localUpdatedRows;
  }
  throw new UserError(`Unsupported data source type! ${ds.type}`);
}
async function deleteMany(client, session, ds, _deletedRows) {
  let localDeletedRows = _deletedRows;
  if (ds.readOnly) {
    throw new UserError('Data source is read only!');
  }
  if (ds.beforeDelete) {
    localDeletedRows = await ds.beforeDelete({
      rows: localDeletedRows,
      session,
      client,
    });
  }
  if (ds.type === 'Table') {
    const pkColumns = [];
    for (const attr of ds.attributes) {
      const column = attr.column;
      if (column == null || !attr.primary) {
        continue;
      }
      if (column === column.toLowerCase()) {
        pkColumns.push(column);
      } else {
        pkColumns.push(`"${column}"`);
      }
    }
    const params = [];
    let counter = 0;
    const binds = [];
    for (const row of localDeletedRows) {
      const rowBinds = [];
      for (const attr of ds.attributes) {
        const column = attr.column;
        if (column == null || !attr.primary) {
          continue;
        }
        rowBinds.push(`$${++counter}`);
        params.push(row[attr.code]);
      }
      binds.push(`(${rowBinds.join(', ')})`);
    }
    const sql = `DELETE FROM ${ds.schema ? `${ds.schema}.` : ''}${ds.tableName} 
      WHERE (${pkColumns.join(', ')})
      IN (${binds.join(', ')})`;
    try {
      await client.query(sql, params);
    } catch (e) {
      logger.error(getErrorMessage(e));
      logger.error('sql: ', sql);
      logger.error(`params: ${JSON.stringify(params)}`);
      throw e;
    }
    // console.log('multi delete results', result);
    if (ds.afterDelete) {
      localDeletedRows = await ds.afterDelete({
        rows: localDeletedRows,
        session,
        client,
      });
    }
    return localDeletedRows;
  }
  throw new UserError(`Unsupported data source type! ${ds.type}`);
}
async function prepareForUpdate(client, session, ds, rows, attributesInUpdate) {
  const { readOnlyColumns, pkAttributes, auditAttributes } = classifyUpdateAttributes(ds);
  const { updatedByAttr, updatedAtAttr } = getWhoAttributes(ds);
  for (const row of rows) {
    for (const attr of ds.attributes) {
      validateRowForUpdateOrDelete(ds, row, attr, attributesInUpdate);
    }
  }
  if (!ds.skipQueryForUpdate && rows.length > 0) {
    const currentRowsMap = await loadCurrentRowsForUpdate(client, session, ds, rows, pkAttributes);
    const currentRows = [];
    const allAuditRows = [];
    for (const row of rows) {
      const pkValueStr = getPkValueStr(row, pkAttributes);
      const dbRow = currentRowsMap.get(pkValueStr);
      if (!dbRow) {
        throw new UserError(`Record not found for update in data source ${ds.id} (pk: ${pkValueStr})!`);
      }
      currentRows.push(dbRow);
      const dbUpdatedAt = toIsoString(dbRow[updatedAtAttr.code]);
      if (dbUpdatedAt == null) {
        throw new UserError(`Record has no updatedAt attribute in data source ${ds.id} (pk: ${pkValueStr})!`);
      }
      const updatedAt = toIsoString(row[updatedAtAttr.code]);
      const dbUpdatedBy = dbRow[updatedByAttr.code];
      if (dbUpdatedAt !== updatedAt) {
        throw new UserError(
          `Record has been updated by ${dbUpdatedBy} since it was read! Last updated at ${dbUpdatedAt}! You read it at ${updatedAt ?? 'null'}! (pk: ${pkValueStr})`,
        );
      }
      for (const code of readOnlyColumns) {
        row[code] = dbRow[code];
      }
      for (const attr of auditAttributes) {
        let oldValue = dbRow[attr.code];
        if (attr.type === 'Date' && oldValue instanceof Date) {
          // @ts-expect-error oldValue is valid
          oldValue = oldValue.toISOString();
        }
        const newValue = row[attr.code];
        if (deepEqual(oldValue, newValue)) {
          continue;
        }
        const auditRow = {
          datasourceId: ds.id,
          pkValue: pkValueStr,
          attributeCode: attr.code,
          valueType: 'String',
          updatedAt: new Date().toISOString(),
          updatedBy: session.user.userName,
          _status: 'I',
        };
        applyAuditValueToRow(ds, attr, oldValue, auditRow, 'old');
        applyAuditValueToRow(ds, attr, newValue, auditRow, 'new');
        allAuditRows.push(auditRow);
      }
    }
    if (allAuditRows.length > 0) {
      await postDataSource(client, session, getDataSource('Audit'), allAuditRows);
    }
    return currentRows;
  }
  return undefined;
}
// async function validateOne<T extends object>(
//   client: PgPoolClient,
//   session: Session,
//   ds: DataSource<T>,
//   validateRow: Row<T>,
// ): Promise<Row<T>> {
//   if (ds.validateOne) {
//     return ds.validateOne(validateRow, session, client);
//   }
//   return validateRow;
// }
//# sourceMappingURL=postDataSource.js.map
