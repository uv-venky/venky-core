/* Copyright (c) 2023-present Venky Corp. */
export function toCollection(value, msg) {
    if (value !== null && (Array.isArray(value) || typeof value === 'object')) {
        return value;
    }
    throw new Error(msg);
}
export function isArrayCollection(value) {
    return value !== null && Array.isArray(value);
}
export function isObjectCollection(value) {
    return !!value && !Array.isArray(value) && typeof value === 'object';
}
export function isCollection(value) {
    return isArrayCollection(value) || isObjectCollection(value);
}
export function isNull(value) {
    return value === null || value === undefined;
}
export function isPath(path) {
    return Array.isArray(path);
}
export function isSamePath(p1, p2) {
    if (p1.length !== p2.length) {
        return false;
    }
    for (let i = 0; i < p1.length; i++) {
        if (p1[i] !== p2[i]) {
            return false;
        }
    }
    return true;
}
export function isChildPath(parent, path) {
    if (path.length <= parent.length) {
        return false;
    }
    for (let i = 0; i < parent.length; i++) {
        if (path[i] !== parent[i]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=ImmutableTypes.js.map