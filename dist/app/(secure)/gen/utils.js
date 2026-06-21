/* Copyright (c) 2024-present Venky Corp. */
import { camelCase, startCase } from 'lodash-es';
/**
 * Normalize `pg_catalog.format_type()` output for mapping (e.g.
 * `public.character varying(128)` → base `character varying`; `numeric(5,3)` → `numeric`).
 */
export function normalizePgTypeBase(pgType) {
    let t = pgType.trim();
    const dot = t.lastIndexOf('.');
    if (dot !== -1) {
        t = t.slice(dot + 1).trim();
    }
    const isArray = t.endsWith('[]');
    if (isArray) {
        t = t.slice(0, -2).trim();
    }
    t = t.replace(/\(\d+(?:,\s*\d+)?\)\s*$/, '').trim();
    // format_type() uses `varchar`; information_schema / our switch use `character varying`
    if (t === 'varchar') {
        t = 'character varying';
    }
    return { base: t, isArray };
}
export function canBePrimaryKey(pgType, maxLength) {
    const { base } = normalizePgTypeBase(pgType);
    switch (base) {
        case 'integer':
        case 'smallint':
        case 'numeric':
        case 'bigint':
        case 'uuid':
            return true;
        case 'character varying':
        case 'character':
            return maxLength == null || (maxLength > 3 && maxLength <= 256);
        default:
            return false;
    }
}
// Function to map PostgreSQL data types to attribute types
export function getAttributeType(pgType, maxLength) {
    const { base, isArray } = normalizePgTypeBase(pgType);
    if (isArray) {
        if (base === 'character varying' || base === 'character' || base === 'text') {
            return 'TextArray';
        }
        return null;
    }
    switch (base) {
        case 'integer':
        case 'smallint':
        case 'bigint':
        case 'numeric':
        case 'double precision':
        case 'real':
            return 'Number';
        case 'boolean':
            return 'Boolean';
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'date':
            return 'Date';
        case 'time without time zone':
            return 'Time';
        case 'jsonb':
            return 'JSON';
        case 'character varying':
        case 'character':
            return maxLength === 1 ? 'YN' : 'Text';
        case 'text':
            return 'Text';
        case 'uuid':
            return 'UUID';
        case 'polygon':
            return 'Polygon';
        case 'vector':
            return 'Vector';
        default:
            return null;
    }
}
export function getAttributes(columns, index) {
    const attributes = columns
        .map((column) => {
        const type = getAttributeType(column.type, column.maxLength);
        const primary = column.primary ? `\n      primary: true,` : '';
        const optional = !column.nullable ? `\n      optional: false,` : '';
        const allowDecimals = column.allowDecimals ? `\n      allowDecimals: true,` : '';
        const excludeTime = column.excludeTime && type === 'Date' ? `\n      excludeTime: true,` : '';
        const maxLength = column.maxLength ? `\n      maxLength: ${column.maxLength},` : '';
        const defaultValue = column.primary && type === 'UUID' ? `\n      defaultValue: 'UUID',` : '';
        return `
    {
      ...DefaultAttribute,
      code: '${camelCase(column.name)}${index ?? ''}',
      name: '${startCase(camelCase(column.name))}${index ?? ''}',
      type: ${type ? `'${type}'` : `'Text' /* NOT IMPLEMENTED!: ${column.type} ${JSON.stringify(column)} */`},
      column: '${column.name}',${maxLength}${primary}${optional}${allowDecimals}${excludeTime}${defaultValue}
    }`;
    })
        .join(',');
    return attributes;
}
// Function to map PostgreSQL data types to JavaScript data types
function getDataType(pgType, maxLength, allowDecimals, excludeTime) {
    const { base, isArray } = normalizePgTypeBase(pgType);
    if (isArray) {
        if (base === 'character varying' || base === 'character' || base === 'text') {
            return 'string[]';
        }
        return 'unknown';
    }
    switch (base) {
        case 'integer':
        case 'smallint':
        case 'bigint':
            return 'number';
        case 'numeric':
        case 'double precision':
        case 'real':
            return allowDecimals ? 'number' : 'number';
        case 'boolean':
            return 'boolean';
        case 'timestamp with time zone':
        case 'timestamp without time zone':
            return excludeTime ? 'ISODateString' : 'ISODateTimeString';
        case 'date':
            return 'ISODateString';
        case 'time without time zone':
            return 'ISOTimeString';
        case 'character varying':
        case 'text':
        case 'character':
        case 'uuid':
            return maxLength === 1 ? 'YN' : 'string';
        case 'polygon':
            return '[number, number][]';
        case 'vector':
            return 'number[]';
        default:
            return 'unknown';
    }
}
export function getInterfaceFields(columns, index) {
    let hasYNField = false;
    let hasDateTime = false;
    let hasDate = false;
    let hasTime = false;
    const fields = columns
        .map((column) => {
        const type = getDataType(column.type, column.maxLength, column.allowDecimals, column.excludeTime);
        if (type === 'YN') {
            hasYNField = true;
        }
        if (type === 'ISODateTimeString') {
            hasDateTime = true;
        }
        if (type === 'ISODateString') {
            hasDate = true;
        }
        if (type === 'ISOTimeString') {
            hasTime = true;
        }
        if (type === 'unknown') {
            return `  ${camelCase(column.name)}${index ?? ''}${column.nullable ? '?' : ''}: ${type}${column.nullable ? ' | null' : ''}; // ${column.type}`;
        }
        return `  ${camelCase(column.name)}${index ?? ''}${column.nullable ? '?' : ''}: ${type}${column.nullable ? ' | null' : ''};`;
    })
        .join('\n');
    return { fields, hasYNField, hasDateTime, hasDate, hasTime };
}
export function getDefaultOperatorForType(type) {
    if (['Select'].includes(type)) {
        return 'is';
    }
    switch (type) {
        case 'Date':
            return 'on';
        case 'Number':
            return 'eq';
        case 'Boolean':
            return 'istrue';
        case 'YN':
            return 'is';
        case 'TF':
            return 'is';
        default:
            return 'is';
    }
}
//# sourceMappingURL=utils.js.map