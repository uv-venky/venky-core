/**
 * Integration Management
 *
 * Handles encryption/decryption of integration credentials and validation
 */
import 'server-only';
import type { IntegrationConfig, IntegrationType } from '../types/integration';
/**
 * Encrypt integration config object
 */
export declare function encryptConfig(config: Record<string, unknown>): Promise<string>;
/**
 * Decrypt integration config object
 */
export declare function decryptConfig(encryptedConfig: string): Promise<Record<string, unknown>>;
export type DecryptedIntegration = {
    id: string;
    userName: string;
    name: string;
    type: IntegrationType;
    config: IntegrationConfig;
    createdAt: string;
    updatedAt: string;
};
/**
 * Get a single integration by ID
 */
export declare function getIntegration(integrationId: string, userName: string): Promise<DecryptedIntegration | null>;
/**
 * Get a single integration by ID without user check (for system use during workflow execution)
 */
export declare function getIntegrationById(integrationId: string): Promise<DecryptedIntegration | null>;
/**
 * Create a new integration
 */
export declare function createIntegration(userName: string, name: string, type: IntegrationType, config: IntegrationConfig): Promise<DecryptedIntegration>;
/**
 * Update an integration
 */
export declare function updateIntegration(integrationId: string, userName: string, updates: {
    name?: string;
    config?: IntegrationConfig;
}): Promise<DecryptedIntegration | null>;
/**
 * Delete an integration
 */
export declare function deleteIntegration(integrationId: string, userName: string): Promise<boolean>;
/**
 * Workflow node structure for validation
 */
type WorkflowNodeForValidation = {
    data?: {
        config?: {
            integrationId?: string;
        };
    };
};
/**
 * Extract all integration IDs from workflow nodes
 */
export declare function extractIntegrationIds(nodes: WorkflowNodeForValidation[]): string[];
/**
 * Validate that all integration IDs in workflow nodes either:
 * 1. Belong to the specified user, or
 * 2. Don't exist (deleted integrations - stale references are allowed)
 *
 * This prevents users from accessing other users' credentials by embedding
 * foreign integration IDs in their workflows, while allowing workflows
 * with references to deleted integrations to still be saved.
 *
 * @returns Object with `valid` boolean and optional `invalidIds` array
 */
export declare function validateWorkflowIntegrations(nodes: WorkflowNodeForValidation[], userName: string): Promise<{
    valid: boolean;
    invalidIds?: string[];
}>;
export {};
//# sourceMappingURL=integrations.d.ts.map