/* Copyright (c) 2023-present Venky Corp */
export class AssertionError extends Error {
    name = 'AssertionError';
}
export default function assert(condition, message) {
    if (process.env.NODE_ENV !== 'production') {
        if (!condition) {
            if (process.env.NODE_ENV === 'development') {
                // biome-ignore lint/suspicious/noDebugger: only in development
                debugger;
            }
            throw new AssertionError(`Assert failed: ${message}`);
        }
    }
}
export function assertExists(actual, msg) {
    if (actual === undefined || actual === null) {
        const _msg = typeof msg === 'function' ? msg() : msg;
        const msgSuffix = _msg ? `: ${_msg}` : '.';
        const message = `Expected value to not be null or undefined${msgSuffix}`;
        if (process.env.NODE_ENV === 'development') {
            // biome-ignore lint/suspicious/noDebugger: only in development
            debugger;
        }
        throw new AssertionError(message);
    }
}
//# sourceMappingURL=assert.js.map