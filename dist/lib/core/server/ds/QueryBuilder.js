/* Copyright (c) 2024-present Venky Corp. */
import {
  isBooleanType,
  isDateType,
  isNumberType,
  isStringType,
  isTFType,
  isYNType,
  unwrapFilter,
} from '../../../../lib/core/common/ds/types/attribute-utils';
import {
  coordinatesToPolygonString,
  validatePolygonCoordinates,
  ensurePolygonClosed,
} from '../../../../lib/core/common/ds/types/polygon-utils';
import {
  isBooleanFilterOperator,
  isDateFilterOperator,
  isMultiDateFilterOperator,
  isMultiNumberFilterOperator,
  isMultiStringFilterOperator,
  isNumberFilterOperator,
  isStringFilterOperator,
  isUUIDFilterOperator,
  isMultiUUIDFilterOperator,
  isTextArrayFilterOperator,
  isYNFilterOperator,
} from '../../../../lib/core/common/ds/types/filter';
import { keys } from '../../../../lib/core/common/isEmpty';
import logger from '../../../../lib/core/server/logger';
import { addDays, format, isValid, parseISO, startOfWeek } from 'date-fns';
import { UserError } from '../../common/error';
import { getConfig } from '../../../../lib/core/server/config';
function getAttribute(ds, attr) {
  return ds.attributes.find((a) => a.code === attr);
}
function getPKAttributes(ds) {
  return ds.attributes.filter((a) => a.primary);
}
export var DateExtraTypes;
(function (DateExtraTypes) {
  DateExtraTypes['DayOfMonth'] = 'DayOfMonth';
  DateExtraTypes['DayOfWeek'] = 'DayOfWeek';
  DateExtraTypes['DayOfYear'] = 'DayOfYear';
  DateExtraTypes['Month'] = 'Month';
  DateExtraTypes['Quarter'] = 'Quarter';
  DateExtraTypes['Year'] = 'Year';
})(DateExtraTypes || (DateExtraTypes = {}));
function isNestedFilter(filter) {
  return 'allof' in filter || 'anyof' in filter || 'noneof' in filter;
}
function quoteColumnName(attr, columnQuoteChar, _dbType) {
  if (!attr.column) {
    throw new UserError('Column name is missing');
  }
  if (attr.calculated) {
    return attr.column;
  } else {
    return `x.${columnQuoteChar}${attr.column}${columnQuoteChar}`;
  }
}
function getAliasQuoteChar(dbType) {
  switch (dbType) {
    case 'MySQL':
      return '`';
    case 'Postgres':
    case 'Oracle':
      return '"';
    default:
      return "'";
  }
}
function getColumnQuoteChar(dbType) {
  switch (dbType) {
    case 'MySQL':
      return '`';
    case 'Postgres':
    case 'Oracle':
      return '"';
    default:
      return '';
  }
}
export class QueryBuilder {
  dbType;
  dataSource;
  fetchDistinct;
  fromClause;
  fullSql;
  fullCountSql;
  groupByClause;
  havingClause;
  limit;
  offset;
  orderBy;
  params;
  countParams;
  countOnly;
  selectAttributes;
  selectClause;
  skipPagination;
  whereClause;
  aliasQuoteChar;
  columnQuoteChar;
  selectedRefAliases;
  treeOptions;
  parentRow;
  session;
  constructor(dataSource, session, dbType = 'Postgres') {
    this.dbType = dbType;
    this.session = session;
    if (dataSource.type !== 'Table') {
      throw new UserError('Cannot create QueryBuilder for non-table data source');
    }
    this.dataSource = dataSource;
    this.fetchDistinct = false;
    this.fromClause = [];
    this.fullSql = null;
    this.fullCountSql = null;
    this.groupByClause = [];
    this.havingClause = [];
    this.limit = 20;
    this.offset = 0;
    this.orderBy = [];
    this.params = [];
    this.countParams = [];
    this.selectAttributes = [];
    this.selectClause = [];
    this.skipPagination = false;
    this.whereClause = [];
    this.aliasQuoteChar = getAliasQuoteChar(dbType);
    this.columnQuoteChar = getColumnQuoteChar(dbType);
    this.selectedRefAliases = [];
    this.countOnly = false;
    // Validate that old and new formats are not mixed
    this.validateJoinFormatConsistency();
  }
  /**
   * Validates that old and new join formats are not mixed.
   * Rules:
   * - If `joins` array exists: attributes referencing joins must use `joinAlias` (not `refAlias`)
   * - If `joins` array exists: Reference attributes should not have `refTableName`/`refWhereClause` (join defs are in array)
   * - If `joins` array exists: `joinAlias` values must reference valid join definitions
   * - If no `joins` array: attributes should not use `joinAlias` (would be invalid)
   */
  validateJoinFormatConsistency() {
    const hasJoinsArray = this.dataSource.joins && this.dataSource.joins.length > 0;
    const joinAliases =
      hasJoinsArray && this.dataSource.joins ? new Set(this.dataSource.joins.map((j) => j.alias)) : new Set();
    for (const attr of this.dataSource.attributes) {
      const hasJoinAlias = !!attr.joinAlias;
      const hasRefAlias = !!attr.refAlias;
      const hasRefTableName = !!attr.refTableName;
      const hasRefWhereClause = !!attr.refWhereClause;
      if (hasJoinsArray) {
        // New format: validate consistency
        if (hasJoinAlias && attr.joinAlias) {
          // joinAlias must reference a valid join definition
          if (!joinAliases.has(attr.joinAlias)) {
            throw new UserError(
              `Attribute '${attr.code}' uses joinAlias '${attr.joinAlias}' but no join definition with that alias exists in the joins array. ` +
                `Available join aliases: ${Array.from(joinAliases).join(', ') || 'none'}`,
            );
          }
          // If using joinAlias, should not have refTableName/refWhereClause (those are in joins array)
          if (hasRefTableName || hasRefWhereClause) {
            throw new UserError(
              `Attribute '${attr.code}' uses joinAlias '${attr.joinAlias}' (new format) but also has refTableName/refWhereClause (old format). ` +
                `When using the joins array, join definitions should be in the joins array, not on attributes.`,
            );
          }
        }
        // If Reference attribute has refTableName/refWhereClause, it's mixing formats
        // (unless it's just using refAlias for calculated fields, which is still mixing but less critical)
        if (attr.type === 'Reference' && hasRefTableName && !hasJoinAlias) {
          throw new UserError(
            `DataSource '${this.dataSource.id}' uses the new joins array format, but attribute '${attr.code}' uses old format (refTableName/refWhereClause). ` +
              `Please migrate to use joinAlias and define the join in the joins array.`,
          );
        }
        // If attribute has refAlias that matches a join alias, should use joinAlias instead
        if (hasRefAlias && attr.refAlias && joinAliases.has(attr.refAlias) && !hasJoinAlias) {
          throw new UserError(
            `Attribute '${attr.code}' uses refAlias '${attr.refAlias}' but a join with that alias exists in the joins array. ` +
              `Please use joinAlias instead of refAlias when using the joins array format.`,
          );
        }
      } else {
        // Old format: should not use joinAlias
        if (hasJoinAlias && attr.joinAlias) {
          throw new UserError(
            `Attribute '${attr.code}' uses joinAlias '${attr.joinAlias}' (new format) but DataSource '${this.dataSource.id}' does not have a joins array. ` +
              `Either add a joins array or use refAlias instead.`,
          );
        }
      }
    }
  }
  build() {
    let query = '';
    if (this.treeOptions && !this.treeOptions.lazyLoad) {
      const recursiveSQL = [];
      const childAttribute = getAttribute(this.dataSource, this.treeOptions.childAttribute);
      if (!childAttribute) {
        throw new UserError(`Child attribute ${this.treeOptions.childAttribute} not found`);
      }
      const parentAttribute = getAttribute(this.dataSource, this.treeOptions.parentAttribute);
      if (!parentAttribute) {
        throw new UserError(`Parent attribute ${this.treeOptions.parentAttribute} not found`);
      }
      recursiveSQL.push('WITH RECURSIVE tree AS (\n');
      recursiveSQL.push(`SELECT 0 AS level,`);
      recursiveSQL.push(`ARRAY[`);
      this.appendColumnName(childAttribute, recursiveSQL, this.columnQuoteChar);
      recursiveSQL.push(`::text] AS path,`);
      recursiveSQL.push(
        `EXISTS (SELECT 1 FROM ${this.dataSource.schema ? `${this.dataSource.schema}.` : ''}"${this.dataSource.tableName}" AS child\n WHERE `,
      );
      this.appendColumnName(parentAttribute, recursiveSQL, this.columnQuoteChar, 'child');
      recursiveSQL.push(` = `);
      this.appendColumnName(childAttribute, recursiveSQL, this.columnQuoteChar);
      recursiveSQL.push(`) AS ${this.aliasQuoteChar}hasChildren${this.aliasQuoteChar},\n`);
      recursiveSQL.push(this.selectClause.join(''));
      recursiveSQL.push(`\nFROM ${this.fromClause.join('')}\n`);
      recursiveSQL.push('WHERE ');
      this.appendColumnName(parentAttribute, recursiveSQL, this.columnQuoteChar);
      recursiveSQL.push(' IS NULL');
      if (this.whereClause.length) {
        recursiveSQL.push(` AND (${this.whereClause.join('')})`);
      }
      recursiveSQL.push('\nUNION ALL\n');
      recursiveSQL.push('SELECT t.level + 1 AS level,');
      recursiveSQL.push(`t.path || `);
      this.appendColumnName(childAttribute, recursiveSQL, this.columnQuoteChar);
      recursiveSQL.push(`::text AS path,`);
      recursiveSQL.push(
        `EXISTS (SELECT 1 FROM ${this.dataSource.schema ? `${this.dataSource.schema}.` : ''}"${this.dataSource.tableName}" AS child\n WHERE `,
      );
      this.appendColumnName(parentAttribute, recursiveSQL, this.columnQuoteChar, 'child');
      recursiveSQL.push(` = `);
      this.appendColumnName(childAttribute, recursiveSQL, this.columnQuoteChar);
      recursiveSQL.push(`) AS ${this.aliasQuoteChar}hasChildren${this.aliasQuoteChar},\n`);
      recursiveSQL.push(this.selectClause.join(''));
      recursiveSQL.push(`\nFROM ${this.fromClause.join('')}\n`);
      recursiveSQL.push('JOIN tree t ON ');
      this.appendColumnName(parentAttribute, recursiveSQL, this.columnQuoteChar);
      recursiveSQL.push(` = t.${this.columnQuoteChar}${this.treeOptions.childAttribute}${this.columnQuoteChar}`);
      if (this.whereClause.length) {
        recursiveSQL.push(`\nWHERE ${this.whereClause.join('')}`);
      }
      recursiveSQL.push('\n)');
      recursiveSQL.push(`\nSELECT * FROM tree`);
      recursiveSQL.push('\nORDER BY path');
      query = recursiveSQL.join('');
    } else {
      query = 'SELECT ';
      if (this.fetchDistinct) {
        query += 'DISTINCT ';
      }
      let childAttribute;
      let parentAttribute;
      if (this.treeOptions?.lazyLoad) {
        childAttribute = getAttribute(this.dataSource, this.treeOptions.childAttribute);
        if (!childAttribute) {
          throw new UserError(`Child attribute ${this.treeOptions.childAttribute} not found`);
        }
        parentAttribute = getAttribute(this.dataSource, this.treeOptions.parentAttribute);
        if (!parentAttribute) {
          throw new UserError(`Parent attribute ${this.treeOptions.parentAttribute} not found`);
        }
        const recursiveSQL = [];
        if (this.parentRow) {
          recursiveSQL.push(`${this.parentRow.level + 1} AS level,`);
        } else {
          recursiveSQL.push(`0 AS level,`);
        }
        recursiveSQL.push(
          ` EXISTS (SELECT 1 FROM ${this.dataSource.schema ? `${this.dataSource.schema}.` : ''}"${this.dataSource.tableName}" AS child\n WHERE `,
        );
        this.appendColumnName(parentAttribute, recursiveSQL, this.columnQuoteChar, 'child');
        recursiveSQL.push(` = `);
        this.appendColumnName(childAttribute, recursiveSQL, this.columnQuoteChar);
        recursiveSQL.push(`) AS ${this.aliasQuoteChar}hasChildren${this.aliasQuoteChar},\n`);
        query += recursiveSQL.join('');
      }
      query += `${this.selectClause.join('')} FROM ${this.fromClause.join('')}`;
      if (this.whereClause.length) {
        query += this.treeOptions?.lazyLoad
          ? ` WHERE (${this.whereClause.join('')})`
          : ` WHERE ${this.whereClause.join('')}`;
        if (this.treeOptions?.lazyLoad) {
          const recursiveSQL = [' AND '];
          if (!parentAttribute) {
            throw new UserError(`Parent attribute ${this.treeOptions.parentAttribute} not found`);
          }
          this.appendColumnName(parentAttribute, recursiveSQL, this.columnQuoteChar);
          if (this.parentRow) {
            recursiveSQL.push(` = $${this.params.length + 1}`);
            this.params.push(this.parentRow[this.treeOptions.childAttribute]);
          } else {
            recursiveSQL.push(` IS NULL`);
          }
          query += recursiveSQL.join('');
        }
      }
      if (this.groupByClause.length) {
        query += ` GROUP BY ${this.groupByClause.join('')}`;
      }
      if (this.havingClause.length) {
        query += ` HAVING ${this.havingClause.join('')}`;
      }
      if (this.orderBy.length) {
        query += ` ORDER BY ${this.orderBy.join('')}`;
      }
    }
    if (!this.skipPagination) {
      switch (this.dbType) {
        case 'SQLServer':
          if (!this.orderBy.length) {
            if (this.groupByClause.length) {
              query += ' ORDER BY 1';
            } else {
              const pk = getPKAttributes(this.dataSource);
              if (pk.length) {
                const orderBy = pk
                  .map((a) => `${quoteColumnName(a, this.columnQuoteChar, this.dbType)} ASC`)
                  .join(', ');
                query += ` ORDER BY ${orderBy}`;
              }
            }
          }
          query += ` OFFSET @P${this.params.length + 1} ROWS FETCH ${this.offset === 0 ? 'FIRST' : 'NEXT'} @P${this.params.length + 2} ROWS ONLY`;
          this.params.push(this.offset);
          this.params.push(this.limit);
          break;
        case 'Oracle':
          if (!this.orderBy.length) {
            if (this.groupByClause.length) {
              query += ' ORDER BY 1';
            } else {
              const pk = getPKAttributes(this.dataSource);
              if (pk.length) {
                const orderBy = pk
                  .map((a) => `${quoteColumnName(a, this.columnQuoteChar, this.dbType)} ASC`)
                  .join(', ');
                query += ` ORDER BY ${orderBy}`;
              }
            }
          }
          query += ` OFFSET :${this.params.length + 1} ROWS FETCH ${this.offset === 0 ? 'FIRST' : 'NEXT'} :${this.params.length + 2} ROWS ONLY`;
          this.params.push(this.offset);
          this.params.push(this.limit);
          break;
        case 'Postgres':
          query += ` LIMIT $${this.params.length + 1} OFFSET $${this.params.length + 2}`;
          this.params.push(this.limit);
          this.params.push(this.offset);
          break;
        default:
          query += ' LIMIT ? OFFSET ?';
          this.params.push(this.limit);
          this.params.push(this.offset);
      }
    }
    return query;
  }
  buildForCount() {
    let query = 'SELECT count(1)';
    query += ` FROM ${this.fromClause.join('')}`;
    if (this.whereClause.length) {
      query += ` WHERE ${this.whereClause.join('')}`;
    }
    if (this.groupByClause.length) {
      query += ` GROUP BY ${this.groupByClause.join('')}`;
    }
    if (this.havingClause.length) {
      query += ` HAVING ${this.havingClause.join('')}`;
    }
    // PostgreSQL-specific issue: omit ORDER BY in count queries
    // if (this.orderBy.length) {
    //     query += ` ORDER BY ${this.orderBy.join(", ")}`;
    // }
    this.countParams = [...this.params];
    if (!this.skipPagination && !this.countOnly) {
      this.countParams = this.countParams.slice(0, -2);
    }
    if (this.groupByClause.length) {
      query = `SELECT count(1) FROM (${query}) AS x`;
    }
    return query;
  }
  getQuery() {
    if (!this.fullSql) {
      this.fullSql = this.build();
    }
    if (this.fullSql) {
      return this.fullSql;
    } else {
      throw new UserError('fullSql is None');
    }
  }
  getCountQuery() {
    if (!this.fullCountSql) {
      this.fullCountSql = this.buildForCount();
    }
    if (this.fullCountSql) {
      return this.fullCountSql;
    } else {
      throw new UserError('full_count_sql is None');
    }
  }
  getParams() {
    return this.params;
  }
  getCountParams() {
    return this.countParams;
  }
  applyQuery(query) {
    if (this.dataSource.type !== 'Table') {
      throw new UserError('Cannot apply query to non-table data source');
    }
    this.selectClause = [];
    this.whereClause = [];
    this.orderBy = [];
    this.groupByClause = [];
    this.havingClause = [];
    this.fromClause = [];
    this.params = [];
    this.fullSql = null;
    this.fullCountSql = null;
    this.selectAttributes = [];
    this.selectedRefAliases = [];
    this.fetchDistinct = false;
    this.skipPagination = false;
    this.countParams = [];
    this.countOnly = query.countOnly ?? false;
    this.parentRow = query.parentRow;
    if (query.treeOptions) {
      if (query.groupBy || query.aggregate || query.fetchDistinct) {
        throw new UserError('Cannot specify both treeOptions and groupBy or aggregate or fetchDistinct');
      }
      this.treeOptions = query.treeOptions;
    }
    if (query.fullSQL != null) {
      throw new UserError('fullSQL is not allowed in client queries');
    }
    if (query.projection != null) {
      if (query.select != null) {
        throw new UserError('Cannot specify both projection and select');
      }
      const select = [];
      Object.entries(query.projection).forEach(([key, value]) => {
        if (value === 1) {
          select.push(key);
        } else {
          throw new UserError(`Projection with value '${value}' is not supported! Use 1 instead.`);
        }
      });
      query.select = select;
    }
    if (query.select != null && query.select.length > 0) {
      const safeJsonKeyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      query.select.forEach((attr) => {
        const attrStr = attr;
        const dotIndex = attrStr.indexOf('.');
        if (dotIndex !== -1) {
          const baseAttr = attrStr.slice(0, dotIndex);
          const jsonKey = attrStr.slice(dotIndex + 1);
          if (!jsonKey) {
            throw new UserError(`Invalid select key: "${attrStr}". JSON key cannot be empty.`);
          }
          if (!safeJsonKeyPattern.test(jsonKey)) {
            throw new UserError(
              `Invalid select key: "${attrStr}". JSON key must be a simple identifier (letters, numbers, underscore).`,
            );
          }
          const jsonAttribute = getAttribute(this.dataSource, baseAttr);
          if (!jsonAttribute) {
            throw new UserError(`Attribute not found for key: ${baseAttr}`);
          }
          if (jsonAttribute.type !== 'JSON') {
            throw new UserError(
              `Select by key "${attrStr}" is only supported for JSON attributes. "${baseAttr}" is not a JSON attribute.`,
            );
          }
          let selectable = jsonAttribute.select;
          if (this.dataSource.getSelectableAttributes) {
            const selectableAttributes = this.dataSource.getSelectableAttributes(this.session);
            selectable = selectableAttributes.some((a) => a.code === baseAttr);
          }
          if (selectable && jsonAttribute.column) {
            this.selectAttributes.push(jsonAttribute);
            if (this.selectClause.length > 0) {
              this.selectClause.push(', ');
            }
            this.appendJsonKeyToSelectClause(jsonAttribute, jsonKey, attrStr);
          }
          return;
        }
        const attribute = getAttribute(this.dataSource, attr);
        if (!attribute) {
          throw new UserError(`Attribute not found for key: ${attr}`);
        }
        let selectable = attribute.select;
        if (this.dataSource.getSelectableAttributes) {
          const selectableAttributes = this.dataSource.getSelectableAttributes(this.session);
          selectable = selectableAttributes.some((a) => a.code === attr);
        }
        if (selectable && attribute.column) {
          this.selectAttributes.push(attribute);
          if (this.selectClause.length > 0) {
            this.selectClause.push(', ');
          }
          this.appendColumnNameToSelectClause(attribute);
          this.selectAttributes.push(attribute);
        }
      });
    }
    if (this.selectClause.length === 0 && !query.aggregate?.length && !query.groupBy?.length) {
      const selectableAttributes = this.dataSource.getSelectableAttributes
        ? this.dataSource.getSelectableAttributes(this.session)
        : this.dataSource.attributes;
      for (const attr of selectableAttributes) {
        if (!attr.select || attr.type === 'Binary' || !attr.column) {
          continue;
        }
        if (this.selectClause.length > 0) {
          this.selectClause.push(', ');
        }
        this.appendColumnNameToSelectClause(attr);
        this.selectAttributes.push(attr);
      }
    }
    if (query.subSQL != null) {
      this.fromClause.push(`(${query.subSQL}) AS x`);
      if (query.subSQLParamList != null) {
        this.params.push(...query.subSQLParamList);
      }
    } else if (query.fromClause != null) {
      this.fromClause.push(query.fromClause);
    } else {
      if (this.dbType === 'Postgres') {
        this.fromClause.push(
          `${this.dataSource.schema ? `${this.dataSource.schema}.` : ''}"${this.dataSource.tableName}" AS x`,
        );
      } else {
        this.fromClause.push(`${this.dataSource.tableName} x`);
      }
    }
    let whereClause = query.whereClause;
    whereClause = whereClause?.trim();
    if (whereClause != null && whereClause.length > 0) {
      this.validateSqlFragment(whereClause, 'whereClause');
      this.appendAnd();
      whereClause = this.parseSql(whereClause, false);
      this.whereClause.push(`(${whereClause})`);
      if (query.whereClauseParamList != null && query.whereClauseParamList.length > 0) {
        this.params.push(...query.whereClauseParamList);
      }
    }
    // Support both new name (filters) and deprecated name (filter). When both exist, consolidate by concatenating.
    if (query.filters != null && query.filter != null) {
      logger.warn(`Query uses both deprecated "filter" and "filters". Use only "filters". ds: ${this.dataSource.id}`);
    }
    const queryFilters =
      query.filters != null && query.filter != null
        ? [...query.filter, ...query.filters]
        : (query.filters ?? query.filter);
    if (queryFilters && queryFilters.length > 0) {
      this.appendAnd();
      this.addCombinerToWhereClause({ allof: queryFilters });
    }
    let hasGroupBy = false;
    if (query.aggregate?.length || query.groupBy?.length) {
      if (query.select != null) {
        throw new UserError('Cannot specify both groupBy/aggregate and select');
      }
      hasGroupBy = true;
      this.selectClause = [];
      this.groupByClause = [];
    }
    if (query.groupBy?.length) {
      query.groupBy.forEach((attr) => {
        const attribute = getAttribute(this.dataSource, attr);
        if (!attribute) {
          throw new UserError(`Attribute not found for key: ${attr}`);
        }
        if (!attribute.select) {
          throw new UserError(`Attribute ${attribute.code} is not allowed in groupBy`);
        }
        this.selectAttributes.push(attribute);
        if (this.selectClause.length > 0) {
          this.selectClause.push(', ');
        }
        this.appendColumnNameToSelectClause(attribute);
        this.appendColumnNameToGroupByClause(attribute);
      });
    }
    if (query.aggregate?.length) {
      query.aggregate.forEach((agg) => {
        const attr = getAttribute(this.dataSource, agg.code);
        if (!attr) {
          throw new UserError(`Attribute not found for key: ${agg.code}`);
        }
        if (!attr.select) {
          throw new UserError(`Attribute ${attr.code} is not allowed in groupBy`);
        }
        if (this.selectClause.length > 0) {
          this.selectClause.push(', ');
        }
        this.selectAttributes.push(attr);
        this.appendAggregateFunctionToSelectClause(attr, agg);
      });
    }
    // Support both new name (match) and deprecated name (data). When both exist, consolidate (match overrides data for same keys).
    if (query.match != null && query.data != null) {
      logger.warn(`Query uses both deprecated "data" and "match". Use only "match". ds: ${this.dataSource.id}`);
    }
    const queryMatch =
      query.match != null && query.data != null ? { ...query.data, ...query.match } : (query.match ?? query.data);
    if (queryMatch != null) {
      Object.entries(queryMatch).forEach(([key, value]) => {
        this.appendToWhereClause(key, value);
      });
    }
    // Automatically add app_id filter if any attribute has defaultValue: 'APP_ID'
    const appIdAttribute = this.dataSource.attributes.find(
      (attr) => attr.defaultValue?.startsWith('APP_ID') && attr.column != null && attr.query !== false,
    );
    if (appIdAttribute) {
      const appId = getConfig('applyQuery').appId;
      if (appIdAttribute.defaultValue === 'APP_ID_OR_CORE') {
        if (logger.debugEnabled) {
          logger.debug(`Adding APP_ID_OR_CORE filter: ${appIdAttribute.code} (${appIdAttribute.column}) = ${appId}`);
        }
        this.appendAnd();
        this.addMultiStringFilterToWhereClause({
          op: 'in',
          value: [appId, 'core'],
          attribute: appIdAttribute,
          key: appIdAttribute.code,
          ignoreCase: false,
        });
      } else {
        if (logger.debugEnabled) {
          logger.debug(`Adding APP_ID filter: ${appIdAttribute.code} (${appIdAttribute.column}) = ${appId}`);
        }
        this.appendToWhereClause(appIdAttribute.code, appId);
      }
    }
    // Automatically add scheduler_id filter if any attribute has defaultValue: 'SCHEDULER_ID'
    const schedulerIdAttribute = this.dataSource.attributes.find(
      (attr) => attr.defaultValue === 'SCHEDULER_ID' && attr.column != null && attr.query !== false,
    );
    if (schedulerIdAttribute) {
      const schedulerId = getConfig('applyQuery').schedulerId;
      if (logger.debugEnabled) {
        logger.debug(
          `Adding SCHEDULER_ID filter: ${schedulerIdAttribute.code} (${schedulerIdAttribute.column}) = ${schedulerId}`,
        );
      }
      this.appendToWhereClause(schedulerIdAttribute.code, schedulerId);
    }
    if (query.sort != null) {
      if (query.orderBy) {
        throw new UserError(
          `You cannot provide both sort and orderBy. Use only one. ds: ${this.dataSource.id}, sort: ${JSON.stringify(query.sort)}, orderBy: ${query.orderBy}`,
        );
      }
      let orderBy = '';
      // @ts-expect-error sort values are number
      const sortList = Object.entries(query.sort);
      if (sortList.length > 1) {
        // Sort attributes by their sort values in ascending order of absolute values
        sortList.sort(([, a], [, b]) => Math.abs(a) - Math.abs(b));
      }
      let primaryKeys = getPKAttributes(this.dataSource);
      for (const [attr, flag] of sortList) {
        // Support sort by JSONB column key: "jsonbCol.key" (e.g. attributes.key)
        const dotIndex = attr.indexOf('.');
        if (dotIndex !== -1) {
          const baseAttr = attr.slice(0, dotIndex);
          const jsonKey = attr.slice(dotIndex + 1);
          if (!jsonKey) {
            throw new UserError(`Invalid sort key: "${attr}". JSON key cannot be empty.`);
          }
          const safeJsonKeyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
          if (!safeJsonKeyPattern.test(jsonKey)) {
            throw new UserError(
              `Invalid sort key: "${attr}". JSON key must be a simple identifier (letters, numbers, underscore).`,
            );
          }
          const jsonAttribute = getAttribute(this.dataSource, baseAttr);
          if (!jsonAttribute) {
            throw new UserError(`Attribute not found for key: ${baseAttr}`);
          }
          if (jsonAttribute.type !== 'JSON') {
            throw new UserError(
              `Sort by key "${attr}" is only supported for JSON attributes. "${baseAttr}" is not a JSON attribute.`,
            );
          }
          const joinAlias = jsonAttribute.joinAlias || jsonAttribute.refAlias;
          if (joinAlias && !this.selectedRefAliases.includes(joinAlias)) {
            this.selectedRefAliases.push(joinAlias);
          }
          const jsonOrderByExpr = this.buildOrderByJsonKey(jsonAttribute, jsonKey, flag);
          if (orderBy) {
            orderBy += ', ';
          }
          orderBy += jsonOrderByExpr;
          primaryKeys = primaryKeys.filter((pk) => pk.code !== attr);
          continue;
        }
        let agg;
        let attribute;
        if (query.aggregate?.length) {
          agg = query.aggregate.find((agg) => agg.intoCode === attr);
          if (agg) {
            attribute = getAttribute(this.dataSource, agg.code);
            if (!attribute) {
              throw new UserError(`Attribute not found for key: ${agg.code}`);
            }
          }
        }
        if (!attribute) {
          attribute = getAttribute(this.dataSource, attr);
          if (!attribute) {
            throw new UserError(`Attribute not found for key: ${attr}`);
          }
        }
        let orderByFunction;
        if (agg) {
          orderByFunction = this.getAggregateFunctionForOrderBy(attribute, agg);
        }
        if (attribute.type === 'JSON') {
          throw new UserError('JSON type attributes are not supported for sorting.');
        }
        if (orderBy) {
          orderBy += ', ';
        }
        orderBy += orderByFunction ?? `#${attr}#`;
        if (isStringType(attribute.type) && this.dbType === 'Postgres' && this.dataSource.id.startsWith('WvPatch')) {
          // Handle Postgres-specific ordering with cast for string attributes
          orderBy += '::TEXT::BYTEA';
        }
        orderBy += flag < 0 ? ' DESC' : ' ASC';
        // Remove the primary key attribute if it is already sorted
        primaryKeys = primaryKeys.filter((pk) => pk.code !== attr);
      }
      if (!hasGroupBy && query.fetchDistinct !== true) {
        for (const pk of primaryKeys) {
          if (orderBy) {
            orderBy += ', ';
          }
          orderBy += `#${pk.code}# ASC`;
        }
      }
      query.orderBy = orderBy;
    }
    if (query.orderBy != null) {
      this.appendOrderByClause(query.orderBy);
    }
    if (this.selectedRefAliases.length > 0) {
      // Check if DataSource uses new joins array format
      if (this.dataSource.joins && this.dataSource.joins.length > 0) {
        // New format: Use centralized joins array
        const expandedAliases = this.expandAliasesWithDependenciesNewFormat(this.selectedRefAliases);
        const sortedJoins = this.getSortedJoinsNewFormat(expandedAliases);
        for (const alias of sortedJoins) {
          const joinDef = this.dataSource.joins.find((j) => j.alias === alias);
          if (joinDef) {
            const joinType = joinDef.joinType === 'INNER' ? 'INNER JOIN' : 'LEFT JOIN';
            const onClause = typeof joinDef.on === 'function' ? joinDef.on() : joinDef.on;
            this.fromClause.push(` ${joinType} ${joinDef.tableName} AS ${alias} ON (${onClause})`);
          }
        }
      } else {
        // Old format: Attribute-based joins (backward compatibility)
        // Only support simple joins to main table - nested joins not supported in old format
        const expandedAliases = this.expandAliasesWithDependencies(this.selectedRefAliases);
        // Check for nested joins in old format and throw error
        this.validateOldFormatJoins(expandedAliases);
        // Build join dependency graph and sort joins topologically
        const sortedJoins = this.getSortedJoins(expandedAliases);
        for (const alias of sortedJoins) {
          const attr = this.dataSource.attributes.find(
            (a) => a.type === 'Reference' && (a.refAlias === alias || a.joinAlias === alias),
          );
          if (attr?.refTableName && attr.refWhereClause) {
            const joinType = attr.refEquiJoin ? 'INNER JOIN' : 'LEFT JOIN';
            this.fromClause.push(
              ` ${joinType} ${attr.refTableName} AS ${alias} ON (${typeof attr.refWhereClause === 'function' ? attr.refWhereClause() : attr.refWhereClause})`,
            );
          }
        }
      }
    }
    if (query.fetchDistinct === true) {
      this.fetchDistinct = true;
    }
    this.offset = query.offset ?? 0;
    this.limit = Math.min(query.limit ?? 20, 100000);
  }
  /**
   * Validates that old format joins only reference the main table (no nested joins).
   * Throws an error if nested joins are detected, directing users to use the new joins array format.
   */
  validateOldFormatJoins(aliases) {
    for (const alias of aliases) {
      const attr = this.dataSource.attributes.find(
        (a) => a.type === 'Reference' && (a.refAlias === alias || a.joinAlias === alias),
      );
      if (attr?.refWhereClause) {
        const clause = typeof attr.refWhereClause === 'function' ? attr.refWhereClause() : attr.refWhereClause;
        // Check if clause references any alias other than 'x' (main table)
        const aliasPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\./g;
        let match;
        const availableAliases = new Set(aliases);
        // biome-ignore lint/suspicious/noAssignInExpressions: needed for regex exec loop
        while ((match = aliasPattern.exec(clause)) !== null) {
          const potentialAlias = match[1];
          // If we find an alias that's not 'x' and is in our available aliases, it's a nested join
          if (potentialAlias !== 'x' && potentialAlias !== alias && availableAliases.has(potentialAlias)) {
            throw new UserError(
              `Nested joins are not supported in the old attribute-based format. ` +
                `Please use the new \`joins\` array format with explicit \`dependsOn\` field. ` +
                `Join '${alias}' depends on '${potentialAlias}', which requires the structured join definition.`,
            );
          }
        }
      }
    }
  }
  /**
   * Returns the dependencies for a join definition — either the explicit `dependsOn` field,
   * or inferred from the ON clause by detecting references to other join aliases.
   */
  getJoinDependencies(joinDef) {
    if (joinDef.dependsOn) {
      return [joinDef.dependsOn];
    }
    // Infer dependencies by scanning the ON clause for references to other join aliases
    if (!this.dataSource.joins) return [];
    const onClause = typeof joinDef.on === 'function' ? joinDef.on() : joinDef.on;
    const deps = [];
    for (const other of this.dataSource.joins) {
      if (other.alias === joinDef.alias) continue;
      // Check if the ON clause references this alias (e.g., "pr.org_id" or "pr.")
      const pattern = new RegExp(`\\b${other.alias}\\.`, 'i');
      if (pattern.test(onClause)) {
        deps.push(other.alias);
      }
    }
    return deps;
  }
  /**
   * Expands a list of aliases to include all transitive dependencies (new format with joins array).
   * If alias A depends on alias B, and A is in the list, B will also be added.
   * Dependencies are resolved from the explicit `dependsOn` field or inferred from ON clauses.
   */
  expandAliasesWithDependenciesNewFormat(aliases) {
    if (aliases.length === 0 || !this.dataSource.joins) {
      return aliases;
    }
    const expanded = new Set(aliases);
    // Recursively add dependencies using explicit dependsOn or inferred from ON clause
    let changed = true;
    while (changed) {
      changed = false;
      for (const alias of Array.from(expanded)) {
        const joinDef = this.dataSource.joins.find((j) => j.alias === alias);
        if (!joinDef) continue;
        for (const dep of this.getJoinDependencies(joinDef)) {
          if (!expanded.has(dep)) {
            expanded.add(dep);
            changed = true;
          }
        }
      }
    }
    return Array.from(expanded);
  }
  /**
   * Builds a dependency graph for joins (new format) and returns them in topological order.
   * Uses explicit `dependsOn` field instead of regex parsing.
   */
  getSortedJoinsNewFormat(aliases) {
    if (aliases.length === 0 || !this.dataSource.joins) {
      return [];
    }
    // Build dependency graph: alias -> array of aliases it depends on
    const dependencies = new Map();
    for (const alias of aliases) {
      const joinDef = this.dataSource.joins.find((j) => j.alias === alias);
      if (joinDef) {
        const deps = this.getJoinDependencies(joinDef).filter((d) => aliases.includes(d));
        dependencies.set(alias, deps);
      } else {
        dependencies.set(alias, []);
      }
    }
    // Topological sort using Kahn's algorithm
    const sorted = [];
    const inDegree = new Map();
    // Initialize in-degree count (how many dependencies each alias has)
    for (const alias of aliases) {
      const deps = dependencies.get(alias) || [];
      inDegree.set(alias, deps.length);
    }
    // Find all nodes with no dependencies (in-degree = 0)
    const queue = [];
    for (const alias of aliases) {
      if ((inDegree.get(alias) || 0) === 0) {
        queue.push(alias);
      }
    }
    // Process queue
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      sorted.push(current);
      // Decrease in-degree for all nodes that depend on current
      for (const [alias, deps] of dependencies) {
        if (deps.includes(current)) {
          const newInDegree = (inDegree.get(alias) || 0) - 1;
          inDegree.set(alias, newInDegree);
          if (newInDegree === 0) {
            queue.push(alias);
          }
        }
      }
    }
    // Check for circular dependencies
    if (sorted.length !== aliases.length) {
      const unsorted = aliases.filter((a) => !sorted.includes(a));
      throw new UserError(
        `Circular dependency detected in DataSource joins. Unable to resolve join order for aliases: ${unsorted.join(', ')}`,
      );
    }
    return sorted;
  }
  /**
   * Expands a list of aliases to include all transitive dependencies (old format).
   * If alias A depends on alias B, and A is in the list, B will also be added.
   * Only supports simple joins to main table.
   */
  expandAliasesWithDependencies(aliases) {
    if (aliases.length === 0) {
      return [];
    }
    const expanded = new Set(aliases);
    const availableAliases = new Set();
    // First, collect all available aliases from the DataSource (old format)
    for (const attr of this.dataSource.attributes) {
      const alias = attr.refAlias || attr.joinAlias;
      if (attr.type === 'Reference' && alias) {
        availableAliases.add(alias);
      }
    }
    // Recursively add dependencies
    let changed = true;
    while (changed) {
      changed = false;
      for (const alias of Array.from(expanded)) {
        const attr = this.dataSource.attributes.find(
          (a) => a.type === 'Reference' && (a.refAlias === alias || a.joinAlias === alias),
        );
        if (attr?.refWhereClause) {
          const clause = typeof attr.refWhereClause === 'function' ? attr.refWhereClause() : attr.refWhereClause;
          const deps = this.extractReferencedAliases(clause, availableAliases, alias);
          for (const dep of deps) {
            if (!expanded.has(dep)) {
              expanded.add(dep);
              changed = true;
            }
          }
        }
      }
    }
    return Array.from(expanded);
  }
  /**
   * Extracts referenced aliases from a refWhereClause string.
   * Looks for patterns like "alias.column" to identify dependencies.
   * Returns an array of aliases that this join depends on (excluding 'x' which is the main table).
   * @param refWhereClause - The WHERE clause for the join
   * @param availableAliases - Set of all available aliases
   * @param currentAlias - The alias for which we're extracting dependencies (to exclude self-references)
   */
  extractReferencedAliases(refWhereClause, availableAliases, currentAlias) {
    const referenced = [];
    // Match patterns like "alias.column" to find alias references
    // This regex matches word boundaries followed by an alias followed by a dot and column name
    const aliasPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\./g;
    let match;
    // biome-ignore lint/suspicious/noAssignInExpressions: needed for regex exec loop
    while ((match = aliasPattern.exec(refWhereClause)) !== null) {
      const potentialAlias = match[1];
      // Skip 'x' (main table), current alias (self-reference), and only include known aliases
      if (potentialAlias !== 'x' && potentialAlias !== currentAlias && availableAliases.has(potentialAlias)) {
        if (!referenced.includes(potentialAlias)) {
          referenced.push(potentialAlias);
        }
      }
    }
    return referenced;
  }
  /**
   * Builds a dependency graph for joins and returns them in topological order.
   * Ensures that joins that depend on other joins are added after their dependencies.
   */
  getSortedJoins(aliases) {
    if (aliases.length === 0) {
      return [];
    }
    // Build a map of alias -> Reference attribute
    const aliasToAttr = new Map();
    const availableAliases = new Set(aliases);
    for (const alias of aliases) {
      const attr = this.dataSource.attributes.find(
        (a) => a.type === 'Reference' && (a.refAlias === alias || a.joinAlias === alias),
      );
      if (attr) {
        aliasToAttr.set(alias, attr);
      }
    }
    // Build dependency graph: alias -> array of aliases it depends on
    const dependencies = new Map();
    for (const alias of aliases) {
      const attr = aliasToAttr.get(alias);
      if (attr?.refWhereClause) {
        const clause = typeof attr.refWhereClause === 'function' ? attr.refWhereClause() : attr.refWhereClause;
        const deps = this.extractReferencedAliases(clause, availableAliases, alias);
        dependencies.set(alias, deps);
      } else {
        dependencies.set(alias, []);
      }
    }
    // Topological sort using Kahn's algorithm
    // In-degree = number of dependencies that must be resolved before this node
    const sorted = [];
    const inDegree = new Map();
    // Initialize in-degree count (how many dependencies each alias has)
    for (const alias of aliases) {
      const deps = dependencies.get(alias) || [];
      inDegree.set(alias, deps.length);
    }
    // Find all nodes with no dependencies (in-degree = 0)
    const queue = [];
    for (const alias of aliases) {
      if ((inDegree.get(alias) || 0) === 0) {
        queue.push(alias);
      }
    }
    // Process queue
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      sorted.push(current);
      // Decrease in-degree for all nodes that depend on current
      // (i.e., current is a dependency of other nodes)
      for (const [alias, deps] of dependencies) {
        if (deps.includes(current)) {
          const newInDegree = (inDegree.get(alias) || 0) - 1;
          inDegree.set(alias, newInDegree);
          if (newInDegree === 0) {
            queue.push(alias);
          }
        }
      }
    }
    // Check for circular dependencies
    if (sorted.length !== aliases.length) {
      const unsorted = aliases.filter((a) => !sorted.includes(a));
      throw new UserError(
        `Circular dependency detected in DataSource joins. Unable to resolve join order for aliases: ${unsorted.join(', ')}`,
      );
    }
    return sorted;
  }
  appendOrderByClause(orderBy) {
    if (orderBy.trim().length > 0) {
      this.validateSqlFragment(orderBy, 'orderBy');
      this.orderBy.push(this.parseSql(orderBy, true));
    }
  }
  appendDateValueToWhereClause(attribute, value) {
    if (value === null || value === undefined) {
      return;
    }
    let dateValue;
    if (value instanceof Date) {
      dateValue = value;
    } else if (typeof value === 'string') {
      dateValue = new Date(value);
      if (Number.isNaN(dateValue.getTime())) {
        throw new UserError(
          `Invalid Request: Expected a valid date string for attribute "${attribute.name}", but found "${value}"`,
        );
      }
    } else if (value instanceof Uint8Array) {
      const decodedValue = new TextDecoder().decode(value);
      dateValue = new Date(decodedValue);
      if (Number.isNaN(dateValue.getTime())) {
        throw new UserError(
          `Invalid Request: Expected a valid date string for attribute "${attribute.name}", but found "${decodedValue}"`,
        );
      }
    } else {
      throw new UserError(
        `Invalid Request: Expected a date value for attribute "${attribute.name}", but found "${value}"`,
      );
    }
    this.appendAnd();
    this.appendColumnNameToWhereClause(attribute);
    this.whereClause.push(' = ');
    this.whereClause.push(this.bindVar(this.params.length + 1));
    this.params.push(dateValue);
  }
  appendNumberValueToWhereClause(attribute, value) {
    if (value === null || value === undefined) {
      return;
    }
    let numericValue;
    if (typeof value === 'number') {
      numericValue = value;
    } else {
      throw new UserError(
        `Invalid Request: Expected a number value for attribute "${attribute.name}", but found "${value}" of type ${typeof value}`,
      );
    }
    this.appendAnd();
    this.appendColumnNameToWhereClause(attribute);
    this.whereClause.push(' = ');
    this.whereClause.push(this.bindVar(this.params.length + 1));
    this.params.push(numericValue);
  }
  appendBooleanValueToWhereClause(attribute, value) {
    if (value === null || value === undefined) {
      return;
    }
    let booleanValue;
    if (typeof value === 'boolean') {
      booleanValue = value;
    } else {
      throw new UserError(
        `Invalid Request: Expected a boolean value for attribute "${attribute.name}", but found "${value}"`,
      );
    }
    this.appendAnd();
    this.appendColumnNameToWhereClause(attribute);
    this.whereClause.push(' = ');
    this.whereClause.push(this.bindVar(this.params.length + 1));
    this.params.push(booleanValue);
  }
  appendStringValueToWhereClause(attribute, value) {
    if (value === null || value === undefined) {
      return;
    }
    let stringValue;
    if (typeof value === 'string' || value instanceof String) {
      stringValue = value;
    } else if (value instanceof Uint8Array) {
      stringValue = new TextDecoder().decode(value);
    } else {
      throw new UserError(
        `Invalid Request: Expected a string value for attribute "${attribute.name}", but found "${value}"`,
      );
    }
    this.appendAnd();
    // if (attribute.noUppercaseSearch) {
    this.appendColumnNameToWhereClause(attribute);
    // } else {
    //   this.appendSqlUpperToWhereClause(attribute);
    //   stringValue = stringValue.toUpperCase();
    // }
    if (stringValue.includes('%')) {
      if (this.dbType === 'Postgres' && attribute.type === 'JSON') {
        this.whereClause.push('::text');
      }
      this.whereClause.push(' LIKE ');
    } else {
      this.whereClause.push(' = ');
    }
    this.whereClause.push(this.bindVar(this.params.length + 1));
    if (attribute.type.startsWith('Enum:')) {
      if (this.dbType === 'Postgres') {
        this.whereClause.push('::');
        this.whereClause.push(attribute.type.substring(5));
      }
    }
    this.params.push(stringValue);
  }
  appendUUIDValueToWhereClause(attribute, value) {
    if (value === null || value === undefined) {
      return;
    }
    let stringValue;
    if (typeof value === 'string' || value instanceof String) {
      stringValue = value;
    } else if (value instanceof Uint8Array) {
      stringValue = new TextDecoder().decode(value);
    } else {
      throw new UserError(
        `Invalid Request: Expected a string value for attribute "${attribute.name}", but found "${value}"`,
      );
    }
    this.appendAnd();
    this.appendColumnNameToWhereClause(attribute);
    this.whereClause.push(' = ');
    this.whereClause.push(this.bindVar(this.params.length + 1));
    if (this.dbType === 'Postgres') {
      this.whereClause.push('::uuid');
    }
    this.params.push(stringValue);
  }
  appendPolygonValueToWhereClause(attribute, value) {
    if (value === null || value === undefined) {
      return;
    }
    let coordinates;
    if (Array.isArray(value)) {
      // Validate and ensure closed polygon
      coordinates = ensurePolygonClosed(validatePolygonCoordinates(value));
    } else {
      throw new UserError(
        `Invalid Request: Expected an array of coordinate pairs for attribute "${attribute.name}", but found "${value}"`,
      );
    }
    // Convert to polygon string format
    const polygonString = coordinatesToPolygonString(coordinates);
    this.appendAnd();
    this.appendColumnNameToWhereClause(attribute);
    this.whereClause.push(' = ');
    this.whereClause.push(this.bindVar(this.params.length + 1));
    this.whereClause.push('::polygon');
    this.params.push(polygonString);
  }
  appendToWhereClause(key, value) {
    const attribute = getAttribute(this.dataSource, key);
    if (!attribute) {
      throw new UserError(`Attribute not found for key: ${key}`);
    }
    if (!attribute.query) {
      return;
    }
    switch (attribute.type) {
      case 'Date':
        this.appendDateValueToWhereClause(attribute, value);
        break;
      case 'Boolean':
        this.appendBooleanValueToWhereClause(attribute, value);
        break;
      case 'Number':
        this.appendNumberValueToWhereClause(attribute, value);
        break;
      case 'UUID':
        this.appendUUIDValueToWhereClause(attribute, value);
        break;
      case 'Polygon':
        this.appendPolygonValueToWhereClause(attribute, value);
        break;
      case 'YN':
      case 'TF':
      case 'Text':
        this.appendStringValueToWhereClause(attribute, value);
        break;
      case 'Reference':
        if (attribute.ref) {
          switch (attribute.ref.type) {
            case 'Boolean':
            case 'Number':
              this.appendNumberValueToWhereClause(attribute, value);
              break;
            case 'Text':
            case 'YN':
            case 'TF':
            case 'Reference':
              this.appendStringValueToWhereClause(attribute, value);
              break;
            case 'UUID':
              this.appendUUIDValueToWhereClause(attribute, value);
              break;
            default:
              if (attribute.ref.type.startsWith('Enum:')) {
                this.appendStringValueToWhereClause(attribute, value);
              } else {
                throw new UserError(
                  `Field type "${attribute.type} -> ${attribute.ref.type}" for field "${attribute.name}" is not searchable!`,
                );
              }
          }
        } else {
          throw new UserError(`Missing reference metadata for field "${attribute.name}"`);
        }
        break;
      default:
        if (attribute.type.startsWith('Enum:')) {
          this.appendStringValueToWhereClause(attribute, value);
        } else {
          throw new UserError(`Field type "${attribute.type}" for field "${attribute.name}" is not searchable!`);
        }
    }
  }
  appendAggregateFunctionToSelectClause(attribute, aggregate) {
    const fnName = (() => {
      switch (aggregate.func) {
        case 'Sum':
          return 'SUM';
        case 'Avg':
          return 'AVG';
        case 'Min':
          return 'MIN';
        case 'Max':
          return 'MAX';
        case 'DistinctCount':
        case 'Count':
          return 'COUNT';
        default:
          throw new UserError(`Unsupported aggregate function: ${aggregate.func}`);
      }
    })();
    this.selectClause.push(`${fnName}(`);
    if (aggregate.func === 'DistinctCount') {
      this.selectClause.push('DISTINCT ');
    }
    this.appendColumnName(attribute, this.selectClause, this.columnQuoteChar);
    this.selectClause.push(`) ${this.aliasQuoteChar}${aggregate.intoCode}${this.aliasQuoteChar}`);
  }
  getAggregateFunctionForOrderBy(attribute, aggregate) {
    const orderBy = [];
    const fnName = (() => {
      switch (aggregate.func) {
        case 'Sum':
          return 'SUM';
        case 'Avg':
          return 'AVG';
        case 'Min':
          return 'MIN';
        case 'Max':
          return 'MAX';
        case 'DistinctCount':
        case 'Count':
          return 'COUNT';
        default:
          throw new UserError(`Unsupported aggregate function: ${aggregate.func}`);
      }
    })();
    orderBy.push(`${fnName}(`);
    if (aggregate.func === 'DistinctCount') {
      orderBy.push('DISTINCT ');
    }
    this.appendColumnName(attribute, orderBy, this.columnQuoteChar);
    orderBy.push(')');
    return orderBy.join('');
  }
  /**
   * Build ORDER BY expression for sorting by a key inside a JSON/JSONB column.
   * Used when query.sort contains a dotted key like "attributes.key".
   */
  buildOrderByJsonKey(attribute, jsonKey, flag) {
    if (!attribute.column) {
      throw new UserError('Column name is missing for JSON attribute');
    }
    const q = this.columnQuoteChar;
    const alias = attribute.joinAlias || attribute.refAlias;
    const quotedColumn = attribute.calculated
      ? attribute.column
      : alias
        ? `${alias}.${q}${attribute.column}${q}`
        : quoteColumnName(attribute, this.columnQuoteChar, this.dbType);
    const direction = flag < 0 ? ' DESC' : ' ASC';
    switch (this.dbType) {
      case 'Postgres':
        return `${quotedColumn}->>'${jsonKey}'${direction}`;
      case 'MySQL':
        return `JSON_UNQUOTE(JSON_EXTRACT(${quotedColumn}, '$.${jsonKey}'))${direction}`;
      default:
        throw new UserError(
          `Sort by JSON key is not supported for database type: ${this.dbType}. Use Postgres or MySQL.`,
        );
    }
  }
  appendColumnNameToGroupByClause(attr) {
    if (this.groupByClause.length > 0) {
      this.groupByClause.push(', ');
    }
    this.appendColumnName(attr, this.groupByClause, this.columnQuoteChar);
  }
  addCombinerToWhereClause(nf) {
    const combiner = keys(nf)[0];
    const filters = nf[combiner];
    if (filters == null) {
      throw new UserError('Developer Error: Invalid filter');
    }
    switch (combiner) {
      case 'allof': {
        this.whereClause.push('(');
        for (let i = 0; i < filters.length; i++) {
          if (i !== 0) {
            this.whereClause.push(' AND ');
          }
          this.addFilterToWhereClause(filters[i]);
        }
        this.whereClause.push(')');
        break;
      }
      case 'anyof': {
        this.whereClause.push('(');
        for (let i = 0; i < filters.length; i++) {
          if (i !== 0) {
            this.whereClause.push(' OR ');
          }
          this.addFilterToWhereClause(filters[i]);
        }
        this.whereClause.push(')');
        break;
      }
      case 'noneof': {
        this.whereClause.push('NOT (');
        for (let i = 0; i < filters.length; i++) {
          if (i !== 0) {
            this.whereClause.push(' OR ');
          }
          this.addFilterToWhereClause(filters[i]);
        }
        this.whereClause.push(')');
        break;
      }
      default:
        throw new UserError(`Unsupported combiner type: ${combiner}`);
    }
  }
  appendColumnNameToWhereClause(attribute) {
    // Support both refAlias (old) and joinAlias (new)
    const alias = attribute.joinAlias || attribute.refAlias;
    if (attribute.type !== 'Reference' && alias && !this.selectedRefAliases.includes(alias)) {
      this.selectedRefAliases.push(alias);
    }
    this.appendColumnName(attribute, this.whereClause, this.columnQuoteChar);
  }
  /**
   * Appends column reference or JSONB key expression to WHERE clause.
   * When jsonKey is set, appends e.g. x."attributes"->>'key' (Postgres).
   * When cast is set with jsonKey, wraps expression for number/boolean/date comparison (e.g. (expr)::numeric).
   */
  appendColumnOrJsonKeyToWhereClause(attribute, jsonKey, cast) {
    const alias = attribute.joinAlias || attribute.refAlias;
    if (attribute.type !== 'Reference' && alias && !this.selectedRefAliases.includes(alias)) {
      this.selectedRefAliases.push(alias);
    }
    if (jsonKey != null) {
      const expr = this.getJsonKeyColumnExpression(attribute, jsonKey);
      if (cast != null && this.dbType === 'Postgres') {
        this.whereClause.push('(');
        this.whereClause.push(expr);
        this.whereClause.push(`)::${cast}`);
      } else {
        this.whereClause.push(expr);
      }
    } else {
      this.appendColumnName(attribute, this.whereClause, this.columnQuoteChar);
    }
  }
  /**
   * Appends UPPER(column) or UPPER(column->>'key') to WHERE clause for case-insensitive comparison.
   */
  appendColumnOrJsonKeyUpperToWhereClause(attribute, jsonKey) {
    const alias = attribute.joinAlias || attribute.refAlias;
    if (attribute.type !== 'Reference' && alias && !this.selectedRefAliases.includes(alias)) {
      this.selectedRefAliases.push(alias);
    }
    this.whereClause.push('UPPER(');
    if (jsonKey != null) {
      this.whereClause.push(this.getJsonKeyColumnExpression(attribute, jsonKey));
    } else {
      this.appendColumnName(attribute, this.whereClause, this.columnQuoteChar);
    }
    this.whereClause.push(')');
  }
  getJsonKeyColumnExpression(attribute, jsonKey) {
    if (!attribute.column) {
      throw new UserError('Column name is missing for JSON attribute');
    }
    const q = this.columnQuoteChar;
    const alias = attribute.joinAlias || attribute.refAlias;
    const quotedColumn = attribute.calculated
      ? attribute.column
      : alias
        ? `${alias}.${q}${attribute.column}${q}`
        : quoteColumnName(attribute, this.columnQuoteChar, this.dbType);
    switch (this.dbType) {
      case 'Postgres':
        return `${quotedColumn}->>'${jsonKey}'`;
      case 'MySQL':
        return `JSON_UNQUOTE(JSON_EXTRACT(${quotedColumn}, '$.${jsonKey}'))`;
      default:
        throw new UserError(
          `Filter by JSON key is not supported for database type: ${this.dbType}. Use Postgres or MySQL.`,
        );
    }
  }
  bindVar(count) {
    switch (this.dbType) {
      case 'SQLServer':
        return `@P${count}`;
      case 'Postgres':
        return `$${count}`;
      case 'Oracle':
        return `:${count}`;
      default:
        return '?';
    }
  }
  appendSqlUpperToWhereClause(attribute) {
    if (attribute.column) {
      // Support both refAlias (old) and joinAlias (new)
      const alias = attribute.joinAlias || attribute.refAlias;
      if (attribute.type !== 'Reference' && alias && !this.selectedRefAliases.includes(alias)) {
        this.selectedRefAliases.push(alias);
      }
      this.whereClause.push('UPPER(');
      this.appendColumnName(attribute, this.whereClause, this.columnQuoteChar);
      this.whereClause.push(')');
    }
  }
  addStringFilterToWhereClause({ op, value, attribute, ignoreCase, jsonKey }) {
    if (ignoreCase) {
      this.appendColumnOrJsonKeyUpperToWhereClause(attribute, jsonKey);
    } else {
      this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey);
    }
    const isStringOrEmptyNotEmpty = typeof value === 'string' || op === 'empty' || op === 'notempty';
    if (isStringOrEmptyNotEmpty)
      switch (op) {
        case 'is': {
          this.whereClause.push(' = ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          const type = attribute.type;
          const enumName = type.startsWith('Enum:') ? type.substring(5) : null;
          if (enumName != null && this.dbType === 'Postgres') {
            this.whereClause.push(`::${enumName}`);
          }
          if (isNumberType(attribute.type)) {
            const parsed = Number.parseFloat(value);
            if (Number.isNaN(parsed)) {
              throw new UserError(
                `Invalid number ${value} for attribute ${attribute.code} in filter ${JSON.stringify(op)}`,
              );
            }
            this.params.push(parsed);
          } else if (ignoreCase) {
            this.params.push(value.toUpperCase());
          } else {
            this.params.push(value);
          }
          break;
        }
        case 'not': {
          this.whereClause.push(' != ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          const type = attribute.type;
          const enumName = type.startsWith('Enum:') ? type.substring(5) : null;
          if (enumName != null && this.dbType === 'Postgres') {
            this.whereClause.push(`::${enumName}`);
          }
          if (isNumberType(attribute.type)) {
            const parsed = Number.parseFloat(value);
            if (Number.isNaN(parsed)) {
              throw new UserError(`Invalid number ${value} for attribute ${attribute.code}`);
            }
            this.params.push(parsed);
          } else if (ignoreCase) {
            this.params.push(value.toUpperCase());
          } else {
            this.params.push(value);
          }
          break;
        }
        case 'empty': {
          this.whereClause.push(' IS NULL');
          break;
        }
        case 'notempty': {
          this.whereClause.push(' IS NOT NULL');
          break;
        }
        case 'nct': {
          this.whereClause.push(' NOT LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(val.includes('%') ? val : `%${val}%`);
          break;
        }
        case 'like': {
          if (this.dbType === 'Postgres' && attribute.type === 'JSON' && jsonKey == null) {
            this.whereClause.push('::text');
          }
          this.whereClause.push(' LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(val.includes('%') ? val : `%${val}%`);
          break;
        }
        case 'sw': {
          if (this.dbType === 'Postgres' && attribute.type === 'JSON' && jsonKey == null) {
            this.whereClause.push('::text');
          }
          this.whereClause.push(' LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(`${val}%`);
          break;
        }
        case 'ew': {
          if (this.dbType === 'Postgres' && attribute.type === 'JSON' && jsonKey == null) {
            this.whereClause.push('::text');
          }
          this.whereClause.push(' LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(`%${val}`);
          break;
        }
        case 'slt': {
          this.whereClause.push(' < ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          this.params.push(value);
          break;
        }
        case 'sgt': {
          this.whereClause.push(' > ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          this.params.push(value);
          break;
        }
        default:
          throw new UserError(`Unsupported StringFilter type: ${attribute.type}`);
      }
  }
  addUUIDFilterToWhereClause({ op, value, attribute }) {
    switch (op) {
      case 'is': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(` = ${this.bindVar(this.params.length + 1)}`);
        if (this.dbType === 'Postgres') {
          this.whereClause.push('::uuid');
        }
        this.params.push(value);
        break;
      }
      case 'not': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(` != ${this.bindVar(this.params.length + 1)}`);
        if (this.dbType === 'Postgres') {
          this.whereClause.push('::uuid');
        }
        this.params.push(value);
        break;
      }
      case 'empty': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notempty': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      case 'isafter': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(` > ${this.bindVar(this.params.length + 1)}`);
        if (this.dbType === 'Postgres') {
          this.whereClause.push('::uuid');
        }
        this.params.push(value);
        break;
      }
      case 'isbefore': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
        if (this.dbType === 'Postgres') {
          this.whereClause.push('::uuid');
        }
        this.params.push(value);
        break;
      }
      default:
        throw new UserError(`Unsupported UUIDFilter type: ${op}`);
    }
  }
  addMultiUUIDFilterToWhereClause({ op, value: values, attribute }) {
    switch (op) {
      case 'in': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'In' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' IN (');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(', ');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          if (this.dbType === 'Postgres') {
            this.whereClause.push('::uuid');
          }
          this.params.push(value);
        });
        this.whereClause.push(')');
        break;
      }
      case 'nin': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Not In' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' NOT IN (');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(', ');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          if (this.dbType === 'Postgres') {
            this.whereClause.push('::uuid');
          }
          this.params.push(value);
        });
        this.whereClause.push(')');
        break;
      }
      default:
        throw new UserError(`Unsupported MultiUUIDFilter type: ${op}`);
    }
  }
  addFilterToWhereClause(filter) {
    if (isNestedFilter(filter)) {
      this.addCombinerToWhereClause(filter);
      return;
    }
    const unwrappedFilter = unwrapFilter(this.dataSource, filter);
    // JSON key filters (e.g. "attributes.key") — dispatch by op/value to number, boolean, date, or string
    if (unwrappedFilter.jsonKey != null && unwrappedFilter.attribute.type === 'JSON') {
      const { op, value } = unwrappedFilter;
      if (isNumberFilterOperator(op) && typeof value === 'number') {
        this.addNumberFilterToWhereClause(unwrappedFilter);
        return;
      }
      if (op === 'istrue' && typeof value === 'boolean') {
        this.addBoolFilterToWhereClause(unwrappedFilter);
        return;
      }
      if (
        isDateFilterOperator(op) &&
        typeof value === 'string' &&
        (['empty', 'notempty'].includes(op) || isValid(new Date(value)))
      ) {
        this.addDateFilterToWhereClause(unwrappedFilter);
        return;
      }
      this.addStringFilterToWhereClause(unwrappedFilter);
      return;
    }
    if (this.isNumberFilter(unwrappedFilter)) {
      this.addNumberFilterToWhereClause(unwrappedFilter);
    } else if (this.isBooleanFilter(unwrappedFilter)) {
      this.addBoolFilterToWhereClause(unwrappedFilter);
    } else if (this.isYNFilter(unwrappedFilter)) {
      this.addYNFilterToWhereClause(unwrappedFilter);
    } else if (this.isTFFilter(unwrappedFilter)) {
      this.addTFFilterToWhereClause(unwrappedFilter);
    } else if (this.isMultiNumberFilter(unwrappedFilter)) {
      this.addMultiNumberFilterToWhereClause(unwrappedFilter);
    } else if (this.isDateFilter(unwrappedFilter)) {
      this.addDateFilterToWhereClause(unwrappedFilter);
    } else if (this.isMultiDateFilter(unwrappedFilter)) {
      this.addMultiDateFilterToWhereClause(unwrappedFilter);
    } else if (this.isTextArrayFilter(unwrappedFilter)) {
      this.addTextArrayFilterToWhereClause(unwrappedFilter);
    } else if (this.isMultiStringFilter(unwrappedFilter)) {
      this.addMultiStringFilterToWhereClause(unwrappedFilter);
    } else if (this.isStringFilter(unwrappedFilter)) {
      this.addStringFilterToWhereClause(unwrappedFilter);
    } else if (this.isUUIDFilter(unwrappedFilter)) {
      this.addUUIDFilterToWhereClause(unwrappedFilter);
    } else if (this.isMultiUUIDFilter(unwrappedFilter)) {
      this.addMultiUUIDFilterToWhereClause(unwrappedFilter);
    } else {
      throw new UserError(`Unsupported or invalid filter: ${JSON.stringify(filter)}`);
    }
  }
  addMultiDateFilterToWhereClause({ op, value, attribute }) {
    if (op === 'bn') {
      const [start, end] = value;
      const from = parseISO(start);
      from.setHours(0, 0, 0, 0);
      let to = parseISO(end);
      to.setHours(0, 0, 0, 0); // Add one day to the end date
      to = addDays(to, 1);
      this.betweenDates(attribute, from, to);
    } else {
      throw new UserError(`Unsupported MultiDateFilter type: ${op}`);
    }
  }
  addDateParam(attribute, value) {
    if (attribute.excludeTime) {
      this.params.push(format(value, 'yyyy-MM-dd'));
    } else if (attribute.excludeTZ) {
      this.params.push(format(value, 'yyyy-MM-dd HH:mm:ss'));
    } else {
      this.params.push(value);
    }
  }
  betweenDates(attribute, from, to, jsonKey) {
    this.whereClause.push('(');
    this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey, jsonKey ? 'date' : undefined);
    this.whereClause.push(` >= ${this.bindVar(this.params.length + 1)}`);
    this.addDateParam(attribute, from);
    this.whereClause.push(' AND ');
    this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey, jsonKey ? 'date' : undefined);
    this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
    this.addDateParam(attribute, to);
    this.whereClause.push(')');
  }
  lastNDays(attribute, x, jsonKey) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const from = addDays(startOfToday, -(x - 1));
    const to = addDays(startOfToday, 1);
    this.betweenDates(attribute, from, to, jsonKey);
  }
  nextNDays(attribute, x, jsonKey) {
    const from = new Date();
    from.setHours(0, 0, 0, 0); // Start of the current day
    const to = addDays(from, x);
    this.betweenDates(attribute, from, to, jsonKey);
  }
  addDateFilterToWhereClause({ op, value, attribute, jsonKey }) {
    if (attribute.type === 'JSON' && jsonKey == null) {
      throw new UserError(
        `Date filters cannot be applied to a whole JSON attribute. Use a key inside the JSON, e.g. "${attribute.code}.dateKey" with type JSON for "${attribute.code}" in DataSource ${this.dataSource.id}.`,
      );
    }
    const appendDateColumn = () =>
      this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey, jsonKey ? 'date' : undefined);
    switch (op) {
      case 'on': {
        const from = parseISO(value);
        from.setHours(0, 0, 0, 0);
        const to = addDays(from, 1);
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'noton': {
        const from = parseISO(value);
        from.setHours(0, 0, 0, 0);
        const to = addDays(from, 1);
        this.whereClause.push('NOT ');
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'empty': {
        this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey);
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notempty': {
        this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey);
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      case 'after': {
        let from = parseISO(value);
        from.setHours(0, 0, 0, 0);
        from = addDays(from, 1);
        appendDateColumn();
        this.whereClause.push(` >= ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, from);
        break;
      }
      case 'before': {
        const from = parseISO(value);
        from.setHours(0, 0, 0, 0);
        appendDateColumn();
        this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, from);
        break;
      }
      case 'beforetime': {
        const from = parseISO(value);
        appendDateColumn();
        this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, from);
        break;
      }
      case 'onorafter': {
        const from = parseISO(value);
        appendDateColumn();
        this.whereClause.push(` >= ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, from);
        break;
      }
      case 'onorbefore': {
        const from = parseISO(value);
        from.setHours(0, 0, 0, 0);
        const to = addDays(from, 1);
        appendDateColumn();
        this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, to);
        break;
      }
      case 'today': {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const to = addDays(now, 1);
        this.betweenDates(attribute, now, to, jsonKey);
        break;
      }
      case 'yesterday': {
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const begin = addDays(end, -1);
        this.betweenDates(attribute, begin, end, jsonKey);
        break;
      }
      case 'last7days': {
        this.lastNDays(attribute, 7, jsonKey);
        break;
      }
      case 'last14days': {
        this.lastNDays(attribute, 14, jsonKey);
        break;
      }
      case 'last28days': {
        this.lastNDays(attribute, 28, jsonKey);
        break;
      }
      case 'thisweek': {
        const now = new Date();
        const from = startOfWeek(now);
        const to = addDays(from, 7);
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'thismonth': {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'thisquarter': {
        const now = new Date();
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        const from = new Date(now.getFullYear(), quarterStartMonth, 1);
        const to = new Date(now.getFullYear(), quarterStartMonth + 3, 1);
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'thisyear': {
        const now = new Date();
        const from = new Date(now.getFullYear(), 0, 1);
        const to = new Date(now.getFullYear() + 1, 0, 1);
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'inthepast': {
        const now = new Date();
        appendDateColumn();
        this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, now);
        break;
      }
      case 'inthefuture': {
        const now = new Date();
        appendDateColumn();
        this.whereClause.push(` > ${this.bindVar(this.params.length + 1)}`);
        this.addDateParam(attribute, now);
        break;
      }
      case 'tomorrow': {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const from = addDays(now, 1);
        const to = addDays(now, 2);
        this.betweenDates(attribute, from, to, jsonKey);
        break;
      }
      case 'next7days': {
        this.nextNDays(attribute, 7, jsonKey);
        break;
      }
      case 'next14days': {
        this.nextNDays(attribute, 14, jsonKey);
        break;
      }
      case 'next28days': {
        this.nextNDays(attribute, 28, jsonKey);
        break;
      }
      default:
        throw new UserError(`Unsupported DateFilter type: ${JSON.stringify(op)}`);
    }
  }
  addMultiNumberFilterToWhereClause({ op, value: values, attribute }) {
    switch (op) {
      case 'bn': {
        this.whereClause.push('(');
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(` >= ${this.bindVar(this.params.length + 1)}`);
        this.params.push(values[0]);
        this.whereClause.push(' AND ');
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(` <= ${this.bindVar(this.params.length + 1)}`);
        this.params.push(values[1]);
        this.whereClause.push(')');
        break;
      }
      case 'in': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'In' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('(');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(' OR ');
          }
          this.appendColumnNameToWhereClause(attribute);
          this.whereClause.push(` = ${this.bindVar(this.params.length + 1)}`);
          this.params.push(value);
        });
        this.whereClause.push(')');
        break;
      }
      case 'nin': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Not In' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('(');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(' AND ');
          }
          this.appendColumnNameToWhereClause(attribute);
          this.whereClause.push(` != ${this.bindVar(this.params.length + 1)}`);
          this.params.push(value);
        });
        this.whereClause.push(')');
        break;
      }
      default:
        throw new UserError(`Unsupported MultiNumberFilter type: ${op}`);
    }
  }
  addBoolFilterToWhereClause({ op, value, attribute, jsonKey }) {
    if (attribute.type === 'JSON' && jsonKey == null) {
      throw new UserError(
        `Boolean filters cannot be applied to a whole JSON attribute. Use a key inside the JSON, e.g. "${attribute.code}.flagKey" with type JSON for "${attribute.code}" in DataSource ${this.dataSource.id}.`,
      );
    }
    this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey, jsonKey ? 'boolean' : undefined);
    switch (op) {
      case 'istrue': {
        this.whereClause.push(` = ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'empty': {
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notempty': {
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      default:
        throw new UserError(`Unsupported BooleanFilter type: ${op}`);
    }
  }
  addYNFilterToWhereClause({ op, value, attribute }) {
    this.appendColumnNameToWhereClause(attribute);
    switch (op) {
      case 'is': {
        this.whereClause.push(` = ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'empty': {
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notempty': {
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      default:
        throw new UserError(`Unsupported YNFilter type: ${op}`);
    }
  }
  addTFFilterToWhereClause({ op, value, attribute }) {
    this.appendColumnNameToWhereClause(attribute);
    switch (op) {
      case 'is': {
        this.whereClause.push(` = ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'empty': {
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notempty': {
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      default:
        throw new UserError(`Unsupported YNFilter type: ${op}`);
    }
  }
  addNumberFilterToWhereClause({ op, value, attribute, jsonKey }) {
    if (attribute.type === 'JSON' && jsonKey == null) {
      throw new UserError(
        `Number filters cannot be applied to a whole JSON attribute. Use a key inside the JSON, e.g. "${attribute.code}.numberKey" with type JSON for "${attribute.code}" in DataSource ${this.dataSource.id}.`,
      );
    }
    this.appendColumnOrJsonKeyToWhereClause(attribute, jsonKey, jsonKey ? 'numeric' : undefined);
    switch (op) {
      case 'eq':
      case 'is': {
        this.whereClause.push(` = ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'ne':
      case 'not': {
        this.whereClause.push(` != ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'gt': {
        this.whereClause.push(` > ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'gte': {
        this.whereClause.push(` >= ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'lt': {
        this.whereClause.push(` < ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'lte': {
        this.whereClause.push(` <= ${this.bindVar(this.params.length + 1)}`);
        this.params.push(value);
        break;
      }
      case 'null': {
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notnull': {
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      default:
        throw new UserError(`Unsupported NumberFilter type: ${op}`);
    }
  }
  addMultiStringFilterToWhereClause({ op, value: values, attribute, ignoreCase }) {
    switch (op) {
      case 'hasall': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Has All' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('(');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(' AND ');
          }
          if (ignoreCase) {
            this.appendSqlUpperToWhereClause(attribute);
          } else {
            this.appendColumnNameToWhereClause(attribute);
          }
          if (this.dbType === 'Postgres' && attribute.type === 'JSON') {
            this.whereClause.push('::text');
          }
          this.whereClause.push(' LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(`%${val}%`);
        });
        this.whereClause.push(')');
        break;
      }
      case 'hasany': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Has Any' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('(');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(' OR ');
          }
          if (ignoreCase) {
            this.appendSqlUpperToWhereClause(attribute);
          } else {
            this.appendColumnNameToWhereClause(attribute);
          }
          if (this.dbType === 'Postgres' && attribute.type === 'JSON') {
            this.whereClause.push('::text');
          }
          this.whereClause.push(' LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(`%${val}%`);
        });
        this.whereClause.push(')');
        break;
      }
      case 'notany': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Not Any' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('NOT(');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(' OR ');
          }
          if (ignoreCase) {
            this.appendSqlUpperToWhereClause(attribute);
          } else {
            this.appendColumnNameToWhereClause(attribute);
          }
          if (this.dbType === 'Postgres' && attribute.type === 'JSON') {
            this.whereClause.push('::text');
          }
          this.whereClause.push(' LIKE ');
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(`%${val}%`);
        });
        this.whereClause.push(')');
        break;
      }
      case 'in': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'In' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        if (ignoreCase) {
          this.appendSqlUpperToWhereClause(attribute);
        } else {
          this.appendColumnNameToWhereClause(attribute);
        }
        this.whereClause.push(' IN (');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(', ');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(val);
        });
        this.whereClause.push(')');
        break;
      }
      case 'nin': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Not In' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        if (ignoreCase) {
          this.appendSqlUpperToWhereClause(attribute);
        } else {
          this.appendColumnNameToWhereClause(attribute);
        }
        this.whereClause.push(' NOT IN (');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(', ');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          let val = value;
          if (ignoreCase) {
            val = value.toUpperCase();
          }
          this.params.push(val);
        });
        this.whereClause.push(')');
        break;
      }
      default:
        throw new UserError(`Unsupported MultiStringFilter type: ${JSON.stringify(op)}`);
    }
  }
  addTextArrayFilterToWhereClause({ op, value: values, attribute }) {
    switch (op) {
      case 'hasall': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Has All' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('(');
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' @> ARRAY[');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(',');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          this.whereClause.push('::varchar');
          this.params.push(value);
        });
        this.whereClause.push('])');
        break;
      }
      case 'hasany': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Has All' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('(');
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' && ARRAY[');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(',');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          this.whereClause.push('::varchar');
          this.params.push(value);
        });
        this.whereClause.push('])');
        break;
      }
      case 'notany': {
        if (values.length === 0) {
          throw new UserError(
            `Empty 'Has All' filter passed for attribute ${attribute.name} [${this.dataSource.id}.${attribute.code}]`,
          );
        }
        this.whereClause.push('NOT (');
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' && ARRAY[');
        values.forEach((value, index) => {
          if (index > 0) {
            this.whereClause.push(',');
          }
          this.whereClause.push(this.bindVar(this.params.length + 1));
          this.whereClause.push('::varchar');
          this.params.push(value);
        });
        this.whereClause.push('])');
        break;
      }
      case 'empty': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' IS NULL');
        break;
      }
      case 'notempty': {
        this.appendColumnNameToWhereClause(attribute);
        this.whereClause.push(' IS NOT NULL');
        break;
      }
      default:
        throw new UserError(`Unsupported TextArrayFilter type: ${JSON.stringify(op)}`);
    }
  }
  appendAnd() {
    if (this.whereClause.length > 0) {
      this.whereClause.push(' AND ');
    }
  }
  appendColumnName(attribute, clause, quoteChar, alias = 'x') {
    if (attribute.column != null) {
      if (attribute.calculated) {
        clause.push(attribute.column);
      } else {
        clause.push(`${alias}.${quoteChar}${attribute.column}${quoteChar}`);
      }
    }
  }
  appendColumnNameToSelectClause(attribute) {
    // Support both refAlias (old) and joinAlias (new)
    const alias = attribute.joinAlias || attribute.refAlias;
    if (alias != null) {
      if (attribute.type !== 'Reference' && !this.selectedRefAliases.includes(alias)) {
        this.selectedRefAliases.push(alias);
      }
    }
    // Polygon / pgvector: serialize as text for API/JSON transport
    if (attribute.type === 'Polygon' || attribute.type === 'Vector') {
      this.appendColumnName(attribute, this.selectClause, this.columnQuoteChar);
      this.selectClause.push('::text');
    } else {
      this.appendColumnName(attribute, this.selectClause, this.columnQuoteChar);
      if (this.dbType === 'Postgres' && attribute.enumValues != null) {
        this.selectClause.push('::text');
      }
      if (attribute.excludeTZ) {
        this.selectClause.push('::timestamptz');
      }
    }
    this.selectClause.push(` ${this.aliasQuoteChar}${attribute.code}${this.aliasQuoteChar}`);
  }
  /**
   * Appends a JSONB key extraction to the select clause (e.g. x."attributes"->>'key' AS "attributes.key").
   * Used when query.select contains a dotted key like "attributes.key".
   */
  appendJsonKeyToSelectClause(attribute, jsonKey, selectAlias) {
    const alias = attribute.joinAlias || attribute.refAlias;
    if (alias != null && !this.selectedRefAliases.includes(alias)) {
      this.selectedRefAliases.push(alias);
    }
    const expr = this.getJsonKeyColumnExpression(attribute, jsonKey);
    this.selectClause.push(expr);
    this.selectClause.push(` ${this.aliasQuoteChar}${selectAlias}${this.aliasQuoteChar}`);
  }
  validateSqlFragment(fragment, context) {
    const dangerousPatterns = [
      ';',
      '--',
      '/*',
      '*/',
      'DROP ',
      'DELETE ',
      'UPDATE ',
      'INSERT ',
      'ALTER ',
      'GRANT ',
      'REVOKE ',
      'TRUNCATE ',
    ];
    const upperFragment = fragment.toUpperCase();
    for (const pattern of dangerousPatterns) {
      if (upperFragment.includes(pattern)) {
        throw new UserError(`Invalid SQL fragment in ${context}: detected dangerous pattern "${pattern}"`);
      }
    }
  }
  parseSql(sqlFragment, isOrderBy) {
    let index = sqlFragment.indexOf('#');
    while (index !== -1) {
      const nextIndex = sqlFragment.indexOf('#', index + 1);
      if (nextIndex === -1) {
        throw new UserError(
          `Developer Error: Invalid ${isOrderBy ? 'order by' : 'where'} clause [${sqlFragment}] for ${this.dataSource.id}`,
        );
      }
      let origHa = sqlFragment.slice(index + 1, nextIndex);
      //   const origHaLen = origHa.length;
      const obj = this.getDateExtraType(origHa);
      if (obj) {
        origHa = obj[1];
      }
      const attr = getAttribute(this.dataSource, origHa);
      if (!attr) {
        logger.error(
          `Developer Error: Invalid attribute [${origHa}] specified in the ${isOrderBy ? 'order by' : 'where'} clause [${sqlFragment}] of ${this.dataSource.id}`,
        );
        throw new UserError(
          `Developer Error: Invalid attribute [${origHa}] specified in the ${isOrderBy ? 'order by' : 'where'} clause [${sqlFragment}] of ${this.dataSource.id}`,
        );
      }
      // Support both refAlias (old) and joinAlias (new)
      const alias = attr.joinAlias || attr.refAlias;
      if (attr.type !== 'Reference' && alias && !this.selectedRefAliases.includes(alias)) {
        this.selectedRefAliases.push(alias);
      }
      const replacementValue = obj
        ? this.getExtraDateColumnName(attr, obj[0])
        : quoteColumnName(attr, this.columnQuoteChar, this.dbType);
      // Replace the attribute placeholder in the SQL fragment
      // biome-ignore lint/style/noParameterAssign: this is ok
      sqlFragment = sqlFragment.slice(0, index) + replacementValue + sqlFragment.slice(nextIndex + 1);
      index = sqlFragment.indexOf('#');
    }
    return sqlFragment;
  }
  getDateExtraType(attr) {
    if (attr.startsWith('@')) {
      if (attr.startsWith('@year')) return [DateExtraTypes.Year, attr.slice(5)];
      if (attr.startsWith('@month')) return [DateExtraTypes.Month, attr.slice(6)];
      if (attr.startsWith('@qtr')) return [DateExtraTypes.Quarter, attr.slice(4)];
      if (attr.startsWith('@dow')) return [DateExtraTypes.DayOfWeek, attr.slice(4)];
      if (attr.startsWith('@dom')) return [DateExtraTypes.DayOfMonth, attr.slice(4)];
      if (attr.startsWith('@doy')) return [DateExtraTypes.DayOfYear, attr.slice(4)];
    }
    return null;
  }
  getExtraDateColumnName(attr, dateExtraType) {
    const columnName = quoteColumnName(attr, this.columnQuoteChar, this.dbType);
    switch (dateExtraType) {
      case DateExtraTypes.Year:
        return `YEAR(${columnName})`;
      case DateExtraTypes.Month:
        return `MONTH(${columnName})`;
      case DateExtraTypes.Quarter:
        return `QUARTER(${columnName})`;
      case DateExtraTypes.DayOfWeek:
        return `DAYOFWEEK(${columnName})`;
      case DateExtraTypes.DayOfMonth:
        return `DAYOFMONTH(${columnName})`;
      case DateExtraTypes.DayOfYear:
        return `DAYOFYEAR(${columnName})`;
      default:
        throw new UserError(`Unknown DateExtraType: ${dateExtraType}`);
    }
  }
  isDateFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isDateType(attribute.type)) {
      return false;
    }
    return (
      isDateFilterOperator(op) &&
      typeof value === 'string' &&
      (['empty', 'notempty'].includes(op) || isValid(new Date(value)))
    );
  }
  isStringFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isStringType(attribute.type) && !(attribute.type === 'Reference' && attribute.ref?.type === 'Text')) {
      return false;
    }
    return isStringFilterOperator(op) && typeof value === 'string';
  }
  isNumberFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isNumberType(attribute.type) && !(attribute.type === 'Reference' && attribute.ref?.type === 'Number')) {
      return false;
    }
    return isNumberFilterOperator(op) && typeof value === 'number';
  }
  isBooleanFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isBooleanType(attribute.type)) {
      return false;
    }
    return isBooleanFilterOperator(op) && typeof value === 'boolean';
  }
  isYNFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isYNType(attribute.type)) {
      return false;
    }
    return isYNFilterOperator(op) && ['Y', 'N'].includes(value);
  }
  isTFFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isTFType(attribute.type)) {
      return false;
    }
    return isYNFilterOperator(op) && ['T', 'F'].includes(value);
  }
  isMultiStringFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isStringType(attribute.type)) {
      return false;
    }
    return isMultiStringFilterOperator(op) && Array.isArray(value) && value.every((v) => typeof v === 'string');
  }
  isTextArrayFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (attribute.type !== 'TextArray') {
      return false;
    }
    return isTextArrayFilterOperator(op) && Array.isArray(value) && value.every((v) => typeof v === 'string');
  }
  isMultiNumberFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isNumberType(attribute.type)) {
      return false;
    }
    return isMultiNumberFilterOperator(op) && Array.isArray(value) && value.every((v) => typeof v === 'number');
  }
  isMultiDateFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (!isDateType(attribute.type)) {
      return false;
    }
    return (
      isMultiDateFilterOperator(op) &&
      Array.isArray(value) &&
      value.every((v) => typeof v === 'string' && isValid(new Date(v)))
    );
  }
  isUUIDFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (attribute.type !== 'UUID' && !(attribute.type === 'Reference' && attribute.ref?.type === 'UUID')) {
      return false;
    }
    return isUUIDFilterOperator(op) && typeof value === 'string';
  }
  isMultiUUIDFilter(unwrappedFilter) {
    const { attribute, op, value } = unwrappedFilter;
    if (attribute.type !== 'UUID') {
      return false;
    }
    return isMultiUUIDFilterOperator(op) && Array.isArray(value) && value.every((v) => typeof v === 'string');
  }
}
//# sourceMappingURL=QueryBuilder.js.map
