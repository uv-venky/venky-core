/* Copyright (c) 2024-present Venky Corp. */
import { UserError } from '../../../../lib/core/common/error';
import { isEmpty } from '../../../../lib/core/common/isEmpty';
import { isNumberType } from '../../../../lib/core/common/ds/types/attribute-utils';
import { normalizeTextArrayElementsForPost, normalizeTextFieldWhitespace, } from '../../../../lib/core/common/normalizeTextFieldWhitespace';
import logger from '../../../../lib/core/server/logger';
import { queryDataSource } from '../../../../lib/core/server/ds/queryDataSource';
import { ulid } from 'ulidx';
import { v7 as uuid } from 'uuid';
import { getConfig } from '../config';
/**
 * Serialize a value for audit logging.
 * Objects are converted to JSON strings, primitives are converted using String().
 */
/**
 * pgvector input must look like `[f1,f2,...]`. node-pg encodes JS arrays as
 * Postgres array text `{f1,f2,...}`, which pgvector rejects ("must start with '['").
 */
export function formatVectorForPostgres(value) {
    if (value == null) {
        return null;
    }
    if (typeof value === 'string') {
        const t = value.trim();
        if (t.startsWith('[')) {
            return t;
        }
        throw new UserError('Vector value must be a number[] or a string in pgvector form starting with "["');
    }
    if (Array.isArray(value) && value.length > 0 && value.every((x) => typeof x === 'number' && Number.isFinite(x))) {
        return `[${value.join(',')}]`;
    }
    if (Array.isArray(value) && value.length === 0) {
        return '[]';
    }
    throw new UserError('Embedding must be a finite number[] or pgvector bracket string');
}
export function normalizeWhitespaceForPost(ds, rows) {
    for (const row of rows) {
        if (row._status === 'D') {
            continue;
        }
        for (const attr of ds.attributes) {
            if (attr.calculated || attr.skipTrimOnPost) {
                continue;
            }
            if (attr.type === 'JSON' || attr.type === 'Binary' || attr.type === 'Polygon' || attr.type === 'Vector') {
                continue;
            }
            const code = attr.code;
            const record = row;
            const val = record[code];
            if (attr.type === 'TextArray' && Array.isArray(val)) {
                const next = normalizeTextArrayElementsForPost(val);
                if (next.some((item, i) => item !== val[i])) {
                    record[code] = next;
                }
                continue;
            }
            if (typeof val === 'string') {
                const next = normalizeTextFieldWhitespace(val);
                if (next !== val) {
                    record[code] = next;
                }
            }
        }
    }
}
function finiteNumberForConstraint(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'bigint') {
        return Number(value);
    }
    if (typeof value === 'string' && value !== '') {
        const n = Number(value);
        if (Number.isFinite(n)) {
            return n;
        }
    }
    return null;
}
function attributeSupportsMaxLengthConstraint(attr) {
    switch (attr.type) {
        case 'Text':
        case 'TextArray':
        case 'Reference':
            return true;
        default:
            return false;
    }
}
/**
 * Enforces {@link Attribute.min}, {@link Attribute.max} (Number), and {@link Attribute.maxLength}
 * (string-like types) before INSERT/UPDATE. Runs after {@link normalizeWhitespaceForPost}.
 */
export function validateAttributeConstraintsForPost(ds, rows) {
    for (const row of rows) {
        if (row._status === 'D') {
            continue;
        }
        const record = row;
        for (const attr of ds.attributes) {
            if (attr.calculated) {
                continue;
            }
            const val = record[attr.code];
            if (isEmpty(val)) {
                continue;
            }
            if (isNumberType(attr.type)) {
                const n = finiteNumberForConstraint(val);
                if (n == null) {
                    continue;
                }
                if (attr.min != null && n < attr.min) {
                    throw new UserError(`${ds.id}.${attr.name} must be at least ${attr.min} (received ${n}).`);
                }
                if (attr.max != null && n > attr.max) {
                    throw new UserError(`${ds.id}.${attr.name} must be at most ${attr.max} (received ${n}).`);
                }
                continue;
            }
            const maxLen = attr.maxLength;
            if (maxLen == null || maxLen <= 0 || !attributeSupportsMaxLengthConstraint(attr)) {
                continue;
            }
            if (attr.type === 'TextArray' && Array.isArray(val)) {
                for (let i = 0; i < val.length; i++) {
                    const el = val[i];
                    if (typeof el === 'string' && el.length > maxLen) {
                        throw new UserError(`Attribute [${ds.id}.${attr.name}] item ${i + 1} is too long (${el.length} characters; max allowed is ${maxLen}).`);
                    }
                }
                continue;
            }
            if (typeof val === 'string' && val.length > maxLen) {
                throw new UserError(`Attribute [${ds.id}.${attr.name}] value is too long (${val.length} characters; max allowed is ${maxLen}).`);
            }
        }
    }
}
export function serializeValueForAudit(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.stringify(value);
        }
        catch {
            return String(value);
        }
    }
    return String(value);
}
export function toIsoString(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'string' && value !== '') {
        return value;
    }
    return null;
}
export function getWhoAttributes(ds) {
    const updatedByAttr = ds.attributes.find((a) => a.code === 'updatedBy' || a.code === 'lastUpdatedBy');
    const updatedAtAttr = ds.attributes.find((a) => a.code === 'updatedAt' || a.code === 'lastUpdateDate');
    if (!updatedByAttr || !updatedAtAttr) {
        throw new UserError(`Data source ${ds.id} has no updatedBy or updatedAt attribute!`);
    }
    return { updatedByAttr, updatedAtAttr };
}
export function classifyUpdateAttributes(ds) {
    const readOnlyColumns = [];
    const pkAttributes = [];
    const auditAttributes = [];
    for (const attr of ds.attributes) {
        if (attr.primary) {
            pkAttributes.push(attr);
        }
        if (!attr.update && !attr.primary) {
            readOnlyColumns.push(attr.code);
        }
        if (attr.audit && attr.update) {
            auditAttributes.push(attr);
        }
    }
    return { readOnlyColumns, pkAttributes, auditAttributes };
}
export function getPkValueStr(row, pkAttributes) {
    const parts = [];
    for (const attr of pkAttributes) {
        const value = row[attr.code];
        if (value == null) {
            throw new UserError(`Primary key attribute ${attr.name} cannot be null!`);
        }
        parts.push(typeof value === 'string' ? value : String(value));
    }
    return parts.join(':');
}
export function applyAuditValueToRow(ds, attr, value, auditRow, prefix) {
    if (value == null) {
        return;
    }
    switch (attr.type) {
        case 'Number':
            if (typeof value === 'number') {
                if (prefix === 'old') {
                    auditRow.oldDoubleValue = value;
                }
                else {
                    auditRow.newDoubleValue = value;
                }
                auditRow.valueType = 'Number';
            }
            else {
                throw new UserError(`Invalid value ${value} of type ${typeof value} for attribute ${ds.id}.${attr.name}!`);
            }
            break;
        case 'Date':
            if (typeof value === 'string') {
                if (prefix === 'old') {
                    auditRow.oldDatetimeValue = value;
                }
                else {
                    auditRow.newDatetimeValue = value;
                }
                auditRow.valueType = 'Date';
            }
            else if (value instanceof Date) {
                const iso = value.toISOString();
                if (prefix === 'old') {
                    auditRow.oldDatetimeValue = iso;
                }
                else {
                    auditRow.newDatetimeValue = iso;
                }
                auditRow.valueType = 'Date';
            }
            else {
                throw new UserError(`Invalid value ${value} of type ${typeof value} for attribute ${ds.id}.${attr.name}!`);
            }
            break;
        default: {
            const isObject = typeof value === 'object' && value !== null;
            const stringValue = serializeValueForAudit(value);
            if (isObject) {
                if (prefix === 'old') {
                    auditRow.oldClobValue = stringValue;
                }
                else {
                    auditRow.newClobValue = stringValue;
                }
                auditRow.valueType = 'JSON';
            }
            else if (stringValue.length > 512) {
                if (prefix === 'old') {
                    auditRow.oldClobValue = stringValue;
                }
                else {
                    auditRow.newClobValue = stringValue;
                }
                auditRow.valueType = 'CLOB';
            }
            else {
                if (prefix === 'old') {
                    auditRow.oldStringValue = stringValue;
                }
                else {
                    auditRow.newStringValue = stringValue;
                }
                auditRow.valueType = 'String';
            }
            break;
        }
    }
}
export async function populateDefaultValues(_client, session, ds, rows) {
    for (const row of rows) {
        for (const attr of ds.attributes) {
            if (attr.calculated) {
                continue;
            }
            if (['createdAt', 'updatedAt', 'lastUpdateDate', 'creationDate'].includes(attr.code)) {
                // @ts-expect-error row[attr.code] is valid
                row[attr.code] = new Date().toISOString();
            }
            else if (['createdBy', 'updatedBy', 'lastUpdatedBy'].includes(attr.code)) {
                if (attr.type === 'Number') {
                    if (session.user.userId == null) {
                        throw new UserError('User ID is required to populate createdBy or updatedBy attribute!');
                    }
                    // @ts-expect-error row[attr.code] is valid
                    row[attr.code] = session.user.userId;
                }
                else {
                    // @ts-expect-error row[attr.code] is valid
                    row[attr.code] = session.user.userName;
                }
            }
            else if (attr.defaultValue) {
                const defaultValue = attr.defaultValue.toUpperCase();
                const hasValue = row[attr.code] != null;
                switch (defaultValue) {
                    case 'UUID':
                        if (!hasValue) {
                            // @ts-expect-error row[attr.code] is valid
                            row[attr.code] = uuid();
                        }
                        break;
                    case 'ULID':
                        if (!hasValue) {
                            // @ts-expect-error row[attr.code] is valid
                            row[attr.code] = ulid();
                        }
                        break;
                    case 'SYSDATE':
                    case 'CURRENT_TIMESTAMP':
                    case 'CURRENT_DATE':
                        if (!hasValue) {
                            // @ts-expect-error row[attr.code] is valid
                            row[attr.code] = new Date().toISOString();
                        }
                        break;
                    case 'USER_NAME':
                        // @ts-expect-error row[attr.code] is valid
                        row[attr.code] = session.user.userName;
                        break;
                    case 'USER_ID':
                        // @ts-expect-error row[attr.code] is valid
                        row[attr.code] = session.user.userId;
                        break;
                    case 'APP_ID':
                    case 'APP_ID_OR_CORE':
                        // @ts-expect-error row[attr.code] is valid
                        row[attr.code] = getConfig('populateDefaultValues').appId;
                        break;
                    case 'SCHEDULER_ID':
                        // @ts-expect-error row[attr.code] is valid
                        row[attr.code] = getConfig('populateDefaultValues').schedulerId;
                        break;
                    default:
                        if (!hasValue) {
                            switch (attr.type) {
                                case 'Boolean':
                                    // @ts-expect-error row[attr.code] is valid
                                    row[attr.code] = defaultValue !== 'FALSE';
                                    break;
                                case 'Number':
                                    // @ts-expect-error row[attr.code] is valid
                                    row[attr.code] = Number(attr.defaultValue);
                                    break;
                                case 'JSON':
                                    row[attr.code] = JSON.parse(attr.defaultValue);
                                    break;
                                default:
                                    // @ts-expect-error row[attr.code] is valid
                                    row[attr.code] = attr.defaultValue;
                            }
                        }
                }
            }
            if (!attr.optional && !attr.auto && isEmpty(row[attr.code])) {
                logger.error(`Missing value for mandatory attribute ${ds.id}.${attr.name}!`, row);
                throw new UserError(`Missing value for mandatory attribute ${ds.id}.${attr.name}!`);
            }
        }
    }
}
export function validateRowForUpdateOrDelete(ds, row, a, attributesInUpdate) {
    if (a.primary) {
        if (row[a.code] == null) {
            logger.error(`Missing value for mandatory attribute ${ds.id}.${a.name}!`, row);
            throw new UserError(`Missing value for mandatory attribute ${ds.id}.${a.name}!`);
        }
    }
    else if ((!attributesInUpdate || attributesInUpdate.has(a.code)) && a.update && !a.optional && !a.calculated) {
        if (row[a.code] == null) {
            logger.error(`Missing value for mandatory attribute ${ds.id}.${a.name}!`, row);
            throw new UserError(`Missing value for mandatory attribute ${ds.id}.${a.name}!`);
        }
    }
}
export async function loadCurrentRowsForUpdate(client, session, ds, rows, pkAttributes) {
    const map = new Map();
    if (rows.length === 0 || ds.skipQueryForUpdate) {
        return map;
    }
    if (pkAttributes.length === 1) {
        const pkAttr = pkAttributes[0];
        const values = rows.map((r) => r[pkAttr.code]);
        for (const v of values) {
            if (v == null) {
                throw new UserError(`Primary key attribute ${ds.id}.${pkAttr.name} cannot be null!`);
            }
        }
        const uniqueValues = pkAttr.type === 'Number'
            ? [...new Set(values)]
            : [...new Set(values.map((x) => String(x)))];
        if (uniqueValues.length === 0) {
            return map;
        }
        const result = await queryDataSource(client, session, ds, {
            filters: [{ [pkAttr.code]: { in: uniqueValues } }],
        });
        if (result.rows.length < uniqueValues.length) {
            const foundKeys = new Set(result.rows.map((r) => getPkValueStr(r, pkAttributes)));
            const missing = rows.find((r) => !foundKeys.has(getPkValueStr(r, pkAttributes)));
            const pkStr = missing ? getPkValueStr(missing, pkAttributes) : (uniqueValues[0]?.toString() ?? '');
            throw new UserError(`Record not found for update in data source ${ds.id} (pk: ${pkStr})!`);
        }
        for (const dbRow of result.rows) {
            map.set(getPkValueStr(dbRow, pkAttributes), dbRow);
        }
        return map;
    }
    const results = await Promise.all(rows.map(async (row) => {
        const data = {};
        const pkValue = [];
        for (const attr of pkAttributes) {
            const value = row[attr.code];
            if (value == null) {
                throw new UserError(`Primary key attribute ${ds.id}.${attr.name} cannot be null!`);
            }
            data[attr.code] = value;
            pkValue.push(typeof value === 'string' ? value : String(value));
        }
        const pkValueStr = pkValue.join(':');
        const result = await queryDataSource(client, session, ds, { data });
        return { pkValueStr, result };
    }));
    for (const { pkValueStr, result } of results) {
        if (result.rows.length === 0) {
            throw new UserError(`Record not found for update in data source ${ds.id} (pk: ${pkValueStr})!`);
        }
        if (result.rows.length > 1) {
            throw new UserError(`Multiple records found for update in data source ${ds.id} (pk: ${pkValueStr})!`);
        }
        map.set(pkValueStr, result.rows[0]);
    }
    return map;
}
export function populateWHOColumnsForUpdate(session, ds, rows) {
    const { updatedByAttr, updatedAtAttr } = getWhoAttributes(ds);
    for (const row of rows) {
        if (updatedByAttr?.type === 'Number') {
            if (session.user.userId == null) {
                throw new UserError('User ID is required to populate updatedBy attribute!');
            }
            // @ts-expect-error row[attr.code] is valid
            row[updatedByAttr.code] = session.user.userId;
        }
        else {
            // @ts-expect-error row[attr.code] is valid
            row[updatedByAttr.code] = session.user.userName;
        }
        if (updatedAtAttr) {
            // @ts-expect-error row[attr.code] is valid
            row[updatedAtAttr.code] = new Date().toISOString();
        }
    }
}
//# sourceMappingURL=dsUtils.js.map