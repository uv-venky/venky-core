/**
 * Action registry context for workflow and server action invocation.
 * Registry is required in server-config; initializeServer(config.actionRegistry) sets it.
 * Every project must pass ACTIONS, ACTION_ACCESS_ROLES, WORKFLOW_CALLABLE_ACTIONS (merge core + app).
 */
export type ActionParamSchemaEntry = {
    name: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    /** True when the param is optional (trailing `?` or `| undefined`) and may be omitted. */
    optional?: boolean;
    /** True when the param type includes `null`. */
    nullable?: boolean;
};
export type ActionRegistry = {
    ACTIONS: Record<string, (client: unknown, session: unknown, ...args: unknown[]) => Promise<unknown>>;
    ACTION_ACCESS_ROLES: Record<string, string[]>;
    WORKFLOW_CALLABLE_ACTIONS: readonly string[];
    ACTION_PARAM_SCHEMAS?: Record<string, ActionParamSchemaEntry[]>;
};
declare global {
    var _$venkyActionRegistry: ActionRegistry | null | undefined;
}
export declare function getActionRegistry(): ActionRegistry;
/** Set by initializeServer(config.actionRegistry). Every project provides actionRegistry in server-config. */
export declare function setActionRegistry(registry: ActionRegistry): void;
//# sourceMappingURL=registry-context.d.ts.map