const isNull = (value) => value === undefined || value == null;
const isEmpty = (value) => isNull(value) || (typeof value === 'string' && value.trim().length === 0);
const nvl = (value, defaultValue) => (isEmpty(value) ? defaultValue : value);
const isNotEmpty = (value) => !isEmpty(value);
const NOT_DEFINED = '_NOT_DEFINED_';
function isNullEqual(a, b) {
    if (isNull(a) && isNull(b)) {
        return true;
    }
    return a === b;
}
function shrink(value = '', len = 40) {
    if (value && value.length > len) {
        return value.substring(0, len);
    }
    return value;
}
function isStrNumEqual(left, right) {
    if (left === right)
        return true;
    if (typeof left === 'number') {
        // biome-ignore lint/style/noParameterAssign: left is not used after this
        left = String(left);
    }
    if (typeof right === 'number') {
        // biome-ignore lint/style/noParameterAssign: right is not used after this
        right = String(right);
    }
    return left === right;
}
function entries(obj) {
    // @ts-expect-error obj is not typed
    return Object.entries(obj);
}
function keys(obj) {
    // @ts-expect-error obj is not typed
    return Object.keys(obj);
}
const EMPTY_ARRAY = Object.freeze([]);
// biome-ignore lint/complexity/noBannedTypes: {} is empty
const EMPTY_OBJECT = Object.freeze({});
function isEmptyObject(obj) {
    if (isNull(obj) || typeof obj !== 'object') {
        return true;
    }
    for (const key in obj) {
        if (Object.hasOwn(obj, key))
            return false;
    }
    return true;
}
function areEqualShallow(a, b) {
    if (a === b) {
        return true;
    }
    if (isNull(a) && isNull(b)) {
        return true;
    }
    if (isNull(a) || isNull(b)) {
        return false;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    if (typeof a === 'object' && typeof b === 'object') {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
        }
        else {
            if (a instanceof Map || b instanceof Map || a instanceof Set || b instanceof Set) {
                return false;
            }
            if (Object.keys(a).length !== Object.keys(b).length) {
                return false;
            }
            for (const key in a) {
                if (a[key] !== b[key]) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}
function emptyFunction() { }
export { EMPTY_ARRAY, EMPTY_OBJECT, NOT_DEFINED, areEqualShallow, emptyFunction, entries, isEmpty, isEmptyObject, isNotEmpty, isNull, isNullEqual, isStrNumEqual, keys, nvl, shrink, };
//# sourceMappingURL=isEmpty.js.map