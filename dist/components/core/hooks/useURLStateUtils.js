'use client';
import clientLogger from '../../../lib/core/client/client-logger';
export function defaultDeserialize(v) {
    if (v == null || v === '')
        return null;
    try {
        return JSON.parse(v);
    }
    catch {
        clientLogger.error({
            message: `Failed to parse JSON: ${v}`,
        });
        return null;
    }
}
export function defaultSerialize(v) {
    if (v == null)
        return '';
    return JSON.stringify(v);
}
export function defaultValidator() {
    return true;
}
export function jsonSerialize(v) {
    const s = JSON.stringify(v);
    return btoa(s);
}
export function jsonDeserialize(v) {
    if (v == null || v === '')
        return null;
    try {
        const s = atob(v);
        return JSON.parse(s);
    }
    catch {
        clientLogger.error({
            message: `Failed to parse JSON: ${v}`,
        });
        return null;
    }
}
export function base64Serialize(v) {
    return btoa(v);
}
export function base64Deserialize(v) {
    if (v == null || v === '')
        return null;
    try {
        return atob(v);
    }
    catch {
        console.error(`Failed to parse base64: ${v}`);
        return null;
    }
}
export function stringSerialize(v) {
    return v;
}
export function stringDeserialize(v) {
    if (v == null || v === '')
        return null;
    return v;
}
export function intSerialize(v) {
    return v.toFixed();
}
export function intDeserialize(v) {
    if (v == null || v === '')
        return null;
    return Number.parseInt(v, 10);
}
//# sourceMappingURL=useURLStateUtils.js.map