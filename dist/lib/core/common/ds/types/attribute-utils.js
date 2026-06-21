import { keys } from '../../../../../lib/core/common/isEmpty';
import { UserError } from '../../../../../lib/core/common/error';
export function isNumberType(dataType) {
    switch (dataType) {
        case 'Number': {
            return true;
        }
        default:
            return false;
    }
}
export function isStringType(dataType) {
    switch (dataType) {
        case 'Text':
        case 'TextArray':
            return true;
        default:
            return false;
    }
}
export function isDateType(dataType) {
    switch (dataType) {
        case 'Date': {
            return true;
        }
        default:
            return false;
    }
}
export function isJSONType(dataType) {
    switch (dataType) {
        case 'JSON': {
            return true;
        }
        default:
            return false;
    }
}
export function isBooleanType(dataType) {
    switch (dataType) {
        case 'Boolean': {
            return true;
        }
        default:
            return false;
    }
}
export function isYNType(dataType) {
    switch (dataType) {
        case 'YN': {
            return true;
        }
        default:
            return false;
    }
}
export function isTFType(dataType) {
    switch (dataType) {
        case 'TF': {
            return true;
        }
        default:
            return false;
    }
}
export function isPolygonType(dataType) {
    switch (dataType) {
        case 'Polygon': {
            return true;
        }
        default:
            return false;
    }
}
const SAFE_JSON_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
export function unwrapFilter(dataSource, filter) {
    const key = keys(filter)[0];
    let attribute;
    let jsonKey;
    const dotIndex = key.indexOf('.');
    if (dotIndex !== -1) {
        const baseAttr = key.slice(0, dotIndex);
        const keyPart = key.slice(dotIndex + 1);
        if (!keyPart) {
            throw new UserError(`Invalid filter key: "${key}". JSON key cannot be empty.`);
        }
        if (!SAFE_JSON_KEY_PATTERN.test(keyPart)) {
            throw new UserError(`Invalid filter key: "${key}". JSON key must be a simple identifier (letters, numbers, underscore).`);
        }
        attribute = dataSource.attributes.find((a) => a.code === baseAttr);
        if (attribute == null) {
            throw new UserError(`Attribute not found for key: ${baseAttr}`);
        }
        if (attribute.type !== 'JSON') {
            throw new UserError(`Filter by key "${key}" is only supported for JSON attributes. "${baseAttr}" is not a JSON attribute.`);
        }
        jsonKey = keyPart;
    }
    else {
        attribute = dataSource.attributes.find((a) => a.code === key);
        if (attribute == null) {
            throw new UserError(`Developer Error: Invalid filter. Attribute not found for key: ${key} Filter: ${JSON.stringify(filter)}, DataSource: ${dataSource.id}`);
        }
    }
    const opValue = filter[key];
    if (opValue == null) {
        throw new UserError('Developer Error: Invalid filter. Missing operator and value!');
    }
    // @ts-expect-error ignoreCase is optional
    const { ignoreCase, ...rest } = opValue;
    const op = keys(rest)[0];
    if (op == null) {
        throw new UserError(`Developer Error: Invalid filter. Missing operator! Filter: ${JSON.stringify(filter)}, DataSource: ${dataSource.id}`);
    }
    // @ts-expect-error op is a valid key
    const value = rest[op];
    return { key, op, value, attribute, ignoreCase, jsonKey };
}
//# sourceMappingURL=attribute-utils.js.map