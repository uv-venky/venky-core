import { LEGACY_ACTION_MAPPINGS } from './legacy-mappings';
/**
 * Integration Registry
 * Auto-populated by plugin files and custom integrations from consuming projects
 */
const integrationRegistry = new Map();
/**
 * Compute full action ID from integration type and action slug
 */
export function computeActionId(integrationType, actionSlug) {
    return `${integrationType}/${actionSlug}`;
}
/**
 * Parse a full action ID into integration type and action slug
 */
export function parseActionId(actionId) {
    if (!actionId || typeof actionId !== 'string') {
        return null;
    }
    const parts = actionId.split('/');
    if (parts.length !== 2) {
        return null;
    }
    return { integration: parts[0], slug: parts[1] };
}
/**
 * Register an integration plugin
 * Accepts both built-in IntegrationPlugin and custom CustomIntegrationPlugin
 */
export function registerIntegration(plugin) {
    integrationRegistry.set(plugin.type, plugin);
}
/**
 * Get an integration plugin by type
 * Accepts both built-in IntegrationType and custom string types
 */
export function getIntegration(type) {
    return integrationRegistry.get(type);
}
/**
 * Get all registered integrations
 */
export function getAllIntegrations() {
    return Array.from(integrationRegistry.values());
}
/**
 * Get all integration types
 */
export function getIntegrationTypes() {
    return Array.from(integrationRegistry.keys());
}
/**
 * Get all actions across all integrations with full IDs
 */
export function getAllActions() {
    const actions = [];
    for (const plugin of integrationRegistry.values()) {
        for (const action of plugin.actions) {
            actions.push({
                ...action,
                id: computeActionId(plugin.type, action.slug),
                integration: plugin.type,
            });
        }
    }
    return actions;
}
/**
 * Get actions by category
 */
export function getActionsByCategory() {
    const categories = {};
    for (const plugin of integrationRegistry.values()) {
        for (const action of plugin.actions) {
            if (!categories[action.category]) {
                categories[action.category] = [];
            }
            categories[action.category].push({
                ...action,
                id: computeActionId(plugin.type, action.slug),
                integration: plugin.type,
            });
        }
    }
    return categories;
}
/**
 * Find an action by full ID (e.g., "resend/send-email")
 * Also supports legacy IDs (e.g., "Send Email") for backward compatibility
 */
export function findActionById(actionId) {
    if (!actionId) {
        return undefined;
    }
    // First try parsing as a namespaced ID
    const parsed = parseActionId(actionId);
    if (parsed) {
        const plugin = integrationRegistry.get(parsed.integration);
        if (plugin) {
            const action = plugin.actions.find((a) => a.slug === parsed.slug);
            if (action) {
                return {
                    ...action,
                    id: actionId,
                    integration: plugin.type,
                };
            }
        }
    }
    // Check legacy mappings for backward compatibility
    const mappedId = LEGACY_ACTION_MAPPINGS[actionId];
    if (mappedId) {
        // Recursively look up the mapped ID
        return findActionById(mappedId);
    }
    // Fall back to legacy label-based lookup (exact label match)
    for (const plugin of integrationRegistry.values()) {
        const action = plugin.actions.find((a) => a.label === actionId);
        if (action) {
            return {
                ...action,
                id: computeActionId(plugin.type, action.slug),
                integration: plugin.type,
            };
        }
    }
    return undefined;
}
/**
 * Get integration labels map
 */
export function getIntegrationLabels() {
    const labels = {};
    for (const plugin of integrationRegistry.values()) {
        labels[plugin.type] = plugin.label;
    }
    return labels;
}
/**
 * Get sorted integration types for dropdowns
 */
export function getSortedIntegrationTypes() {
    return Array.from(integrationRegistry.keys()).sort();
}
/**
 * Get all NPM dependencies across all integrations
 */
export function getAllDependencies() {
    const deps = {};
    for (const plugin of integrationRegistry.values()) {
        if (plugin.dependencies) {
            Object.assign(deps, plugin.dependencies);
        }
    }
    return deps;
}
/**
 * Get NPM dependencies for specific action IDs
 */
export function getDependenciesForActions(actionIds) {
    const deps = {};
    const integrations = new Set();
    // Find which integrations are used
    for (const actionId of actionIds) {
        const action = findActionById(actionId);
        if (action) {
            integrations.add(action.integration);
        }
    }
    // Get dependencies for those integrations
    for (const integrationType of integrations) {
        const plugin = integrationRegistry.get(integrationType);
        if (plugin?.dependencies) {
            Object.assign(deps, plugin.dependencies);
        }
    }
    return deps;
}
/**
 * Get environment variables for a single plugin (from formFields)
 */
export function getPluginEnvVars(plugin) {
    const envVars = [];
    // Get env vars from form fields
    for (const field of plugin.formFields) {
        if (field.envVar) {
            envVars.push({
                name: field.envVar,
                description: field.helpText || field.label,
            });
        }
    }
    return envVars;
}
/**
 * Get all environment variables across all integrations
 */
export function getAllEnvVars() {
    const envVars = [];
    for (const plugin of integrationRegistry.values()) {
        envVars.push(...getPluginEnvVars(plugin));
    }
    return envVars;
}
/**
 * Get credential mapping for a plugin (auto-generated from formFields)
 */
export function getCredentialMapping(plugin, config) {
    const creds = {};
    for (const field of plugin.formFields) {
        if (field.envVar && config[field.configKey]) {
            creds[field.envVar] = String(config[field.configKey]);
        }
    }
    return creds;
}
/**
 * Type guard to check if a field is a group
 */
export function isFieldGroup(field) {
    return field.type === 'group';
}
/**
 * Flatten config fields, extracting fields from groups
 * Useful for validation and AI prompt generation
 */
export function flattenConfigFields(fields) {
    const result = [];
    for (const field of fields) {
        if (isFieldGroup(field)) {
            result.push(...field.fields);
        }
        else {
            result.push(field);
        }
    }
    return result;
}
/**
 * Generate AI prompt section for all available actions
 * This dynamically builds the action types documentation for the AI
 */
export function generateAIActionPrompts() {
    const lines = [];
    for (const plugin of integrationRegistry.values()) {
        for (const action of plugin.actions) {
            const fullId = computeActionId(plugin.type, action.slug);
            // Build example config from configFields (flatten groups)
            const exampleConfig = {
                actionType: fullId,
            };
            const flatFields = flattenConfigFields(action.configFields);
            for (const field of flatFields) {
                // Skip conditional fields in the example
                if (field.showWhen)
                    continue;
                // Use example, defaultValue, or a sensible default based on type
                if (field.example !== undefined) {
                    exampleConfig[field.key] = field.example;
                }
                else if (field.defaultValue !== undefined) {
                    exampleConfig[field.key] = field.defaultValue;
                }
                else if (field.type === 'number') {
                    exampleConfig[field.key] = 10;
                }
                else if (field.type === 'select' && field.options?.[0]) {
                    exampleConfig[field.key] = field.options[0].value;
                }
                else if (field.type === 'action-params') {
                    exampleConfig[field.key] = '[]';
                }
                else {
                    exampleConfig[field.key] = `Your ${field.label.toLowerCase()}`;
                }
            }
            lines.push(`- ${action.label} (${fullId}): ${JSON.stringify(exampleConfig)}`);
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=registry.js.map