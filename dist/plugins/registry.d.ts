import type { IntegrationType, AnyIntegrationType } from '../lib/types/integration';
/**
 * Select Option
 * Used for select/dropdown fields
 */
export type SelectOption = {
  value: string;
  label: string;
};
/**
 * Base Action Config Field
 * Declarative definition of a config field for an action
 */
export type ActionConfigFieldBase = {
  key: string;
  label: string;
  type:
    | 'template-input'
    | 'template-textarea'
    | 'text'
    | 'number'
    | 'select'
    | 'combobox'
    | 'schema-builder'
    | 'single-row-update'
    | 'match-builder'
    | 'multi-select'
    | 'action-params';
  singleRowMode?: 'update' | 'insert' | 'delete';
  placeholder?: string;
  defaultValue?: string;
  example?: string;
  options?: SelectOption[];
  optionsSource?: 'datasources';
  getOptions?: (config?: Record<string, unknown>) => Promise<SelectOption[]> | SelectOption[];
  optionsDependencyKeys?: string[];
  searchPlaceholder?: string;
  rows?: number;
  min?: number;
  required?: boolean;
  showWhen?: {
    field: string;
    equals: string;
  };
  templateExtraVariables?: Array<{
    value: string;
    label: string;
  }>;
};
/**
 * Config Field Group
 * Groups related fields together in a collapsible section
 */
export type ActionConfigFieldGroup = {
  label: string;
  type: 'group';
  fields: ActionConfigFieldBase[];
  defaultExpanded?: boolean;
};
/**
 * Action Config Field
 * Can be either a regular field or a group of fields
 */
export type ActionConfigField = ActionConfigFieldBase | ActionConfigFieldGroup;
/**
 * Output Field Definition
 * Describes an output field available for template autocomplete
 */
export type OutputField = {
  field: string;
  description: string;
};
/**
 * Output Display Config
 * Specifies how to render step output in the workflow runs panel
 */
export type OutputDisplayConfig = {
  type: 'image' | 'video' | 'url';
  field: string;
};
/**
 * Action Definition
 * Describes a single action provided by a plugin
 */
export type PluginAction = {
  slug: string;
  label: string;
  description: string;
  category: string;
  stepFunction: string;
  stepImportPath: string;
  configFields: ActionConfigField[];
  outputFields?: OutputField[];
  outputConfig?: OutputDisplayConfig;
  codegenTemplate?: string;
};
/**
 * Base Integration Plugin Definition
 * Contains all fields needed for an integration, with a generic type parameter
 */
export type IntegrationPluginBase<T extends string = string> = {
  type: T;
  label: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  formFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder?: string;
    helpText?: string;
    helpLink?: {
      text: string;
      url: string;
    };
    configKey: string;
    envVar?: string;
  }>;
  testConfig?: {
    getTestFunction: () => Promise<
      (credentials: Record<string, string>) => Promise<{
        success: boolean;
        error?: string;
      }>
    >;
  };
  dependencies?: Record<string, string>;
  actions: PluginAction[];
};
/**
 * Integration Plugin Definition (built-in types)
 * All information needed to register a new integration in one place
 */
export type IntegrationPlugin = IntegrationPluginBase<IntegrationType>;
/**
 * Custom Integration Plugin Definition
 * For consuming projects to register their own custom integrations
 * Accepts any string as the integration type
 */
export type CustomIntegrationPlugin = IntegrationPluginBase<string>;
/**
 * Action with full ID
 * Includes the computed full action ID (integration/slug)
 */
export type ActionWithFullId = PluginAction & {
  id: string;
  integration: string;
};
/**
 * Compute full action ID from integration type and action slug
 */
export declare function computeActionId(integrationType: string, actionSlug: string): string;
/**
 * Parse a full action ID into integration type and action slug
 */
export declare function parseActionId(actionId: string | undefined | null): {
  integration: string;
  slug: string;
} | null;
/**
 * Register an integration plugin
 * Accepts both built-in IntegrationPlugin and custom CustomIntegrationPlugin
 */
export declare function registerIntegration(plugin: IntegrationPlugin | CustomIntegrationPlugin): void;
/**
 * Get an integration plugin by type
 * Accepts both built-in IntegrationType and custom string types
 */
export declare function getIntegration(type: AnyIntegrationType): IntegrationPluginBase | undefined;
/**
 * Get all registered integrations
 */
export declare function getAllIntegrations(): IntegrationPluginBase[];
/**
 * Get all integration types
 */
export declare function getIntegrationTypes(): string[];
/**
 * Get all actions across all integrations with full IDs
 */
export declare function getAllActions(): ActionWithFullId[];
/**
 * Get actions by category
 */
export declare function getActionsByCategory(): Record<string, ActionWithFullId[]>;
/**
 * Find an action by full ID (e.g., "resend/send-email")
 * Also supports legacy IDs (e.g., "Send Email") for backward compatibility
 */
export declare function findActionById(actionId: string | undefined | null): ActionWithFullId | undefined;
/**
 * Get integration labels map
 */
export declare function getIntegrationLabels(): Record<string, string>;
/**
 * Get sorted integration types for dropdowns
 */
export declare function getSortedIntegrationTypes(): string[];
/**
 * Get all NPM dependencies across all integrations
 */
export declare function getAllDependencies(): Record<string, string>;
/**
 * Get NPM dependencies for specific action IDs
 */
export declare function getDependenciesForActions(actionIds: string[]): Record<string, string>;
/**
 * Get environment variables for a single plugin (from formFields)
 */
export declare function getPluginEnvVars(plugin: IntegrationPluginBase): Array<{
  name: string;
  description: string;
}>;
/**
 * Get all environment variables across all integrations
 */
export declare function getAllEnvVars(): Array<{
  name: string;
  description: string;
}>;
/**
 * Get credential mapping for a plugin (auto-generated from formFields)
 */
export declare function getCredentialMapping(
  plugin: IntegrationPluginBase,
  config: Record<string, unknown>,
): Record<string, string>;
/**
 * Type guard to check if a field is a group
 */
export declare function isFieldGroup(field: ActionConfigField): field is ActionConfigFieldGroup;
/**
 * Flatten config fields, extracting fields from groups
 * Useful for validation and AI prompt generation
 */
export declare function flattenConfigFields(fields: ActionConfigField[]): ActionConfigFieldBase[];
/**
 * Generate AI prompt section for all available actions
 * This dynamically builds the action types documentation for the AI
 */
export declare function generateAIActionPrompts(): string;
//# sourceMappingURL=registry.d.ts.map
