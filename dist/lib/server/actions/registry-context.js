/* Copyright (c) 2024-present Venky Corp. */
export function getActionRegistry() {
    const reg = globalThis._$venkyActionRegistry;
    if (!reg) {
        throw new Error('Action registry not set. init() must run first so initializeServer(config.actionRegistry) is called (actionRegistry is required in ServerConfig).');
    }
    return reg;
}
/** Set by initializeServer(config.actionRegistry). Every project provides actionRegistry in server-config. */
export function setActionRegistry(registry) {
    globalThis._$venkyActionRegistry = registry;
}
//# sourceMappingURL=registry-context.js.map