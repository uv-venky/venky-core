/**
 * Integration Management
 *
 * Handles encryption/decryption of integration credentials and validation
 */
import 'server-only';

import { v7 as uuid } from 'uuid';
import type { IntegrationConfig, IntegrationType } from '../types/integration';
import { transaction } from '@/lib/core/server/db';
import { encrypt, decrypt } from '@/lib/core/server/secure';

/**
 * Encrypt integration config object
 */
export async function encryptConfig(config: Record<string, unknown>): Promise<string> {
  return await encrypt(JSON.stringify(config));
}

/**
 * Decrypt integration config object
 */
export async function decryptConfig(encryptedConfig: string): Promise<Record<string, unknown>> {
  try {
    const decrypted = await decrypt(encryptedConfig);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt integration config:', error);
    return {};
  }
}

export type DecryptedIntegration = {
  id: string;
  userName: string; // Changed from userId
  name: string;
  type: IntegrationType;
  config: IntegrationConfig;
  createdAt: string;
  updatedAt: string;
};

interface IntegrationRow {
  id: string;
  user_name: string;
  name: string;
  type: string;
  config: string; // JSONB stored as string
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

/**
 * Get a single integration by ID
 */
export async function getIntegration(integrationId: string, userName: string): Promise<DecryptedIntegration | null> {
  return await transaction(async (client) => {
    const result = await client.query<IntegrationRow>(
      `
        SELECT *
        FROM uv_integrations
        WHERE id = $1 AND user_name = $2
        LIMIT 1
      `,
      [integrationId, userName],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userName: row.user_name,
      name: row.name,
      type: row.type as IntegrationType,
      config: (await decryptConfig(row.config)) as IntegrationConfig,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

/**
 * Get a single integration by ID without user check (for system use during workflow execution)
 */
export async function getIntegrationById(integrationId: string): Promise<DecryptedIntegration | null> {
  return await transaction(async (client) => {
    const result = await client.query<IntegrationRow>(
      `
        SELECT *
        FROM uv_integrations
        WHERE id = $1
        LIMIT 1
      `,
      [integrationId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userName: row.user_name,
      name: row.name,
      type: row.type as IntegrationType,
      config: (await decryptConfig(row.config)) as IntegrationConfig,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

/**
 * Create a new integration
 */
export async function createIntegration(
  userName: string,
  name: string,
  type: IntegrationType,
  config: IntegrationConfig,
): Promise<DecryptedIntegration> {
  return await transaction(async (client) => {
    const encryptedConfig = await encryptConfig(config);
    const now = new Date().toISOString();
    const id = uuid();

    await client.query(
      `
        INSERT INTO uv_integrations (
          id, user_name, name, type, config,
          created_at, created_by, updated_at, updated_by
        ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)
      `,
      [id, userName, name, type, encryptedConfig, now, userName, now, userName],
    );

    return {
      id,
      userName,
      name,
      type,
      config,
      createdAt: now,
      updatedAt: now,
    };
  });
}

/**
 * Update an integration
 */
export async function updateIntegration(
  integrationId: string,
  userName: string,
  updates: {
    name?: string;
    config?: IntegrationConfig;
  },
): Promise<DecryptedIntegration | null> {
  return await transaction(async (client) => {
    // Check if integration exists and belongs to user
    const existingResult = await client.query<IntegrationRow>(
      `
        SELECT *
        FROM uv_integrations
        WHERE id = $1 AND user_name = $2
        LIMIT 1
      `,
      [integrationId, userName],
    );

    if (existingResult.rows.length === 0) {
      return null;
    }

    const now = new Date().toISOString();

    // Build update query dynamically based on what's being updated
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(updates.name);
    }

    if (updates.config !== undefined) {
      updateFields.push(`config = $${paramIndex++}::jsonb`);
      updateValues.push(await encryptConfig(updates.config));
    }

    updateFields.push(`updated_at = $${paramIndex++}`);
    updateValues.push(now);
    updateFields.push(`updated_by = $${paramIndex++}`);
    updateValues.push(userName);

    // Add WHERE clause parameters
    updateValues.push(integrationId, userName);
    const whereParam1 = paramIndex++;
    const whereParam2 = paramIndex++;

    await client.query(
      `
        UPDATE uv_integrations
        SET ${updateFields.join(', ')}
        WHERE id = $${whereParam1} AND user_name = $${whereParam2}
      `,
      updateValues,
    );

    // Fetch updated row
    const updatedResult = await client.query<IntegrationRow>(
      `
        SELECT *
        FROM uv_integrations
        WHERE id = $1
        LIMIT 1
      `,
      [integrationId],
    );

    const updated = updatedResult.rows[0];
    return {
      id: updated.id,
      userName: updated.user_name,
      name: updated.name,
      type: updated.type as IntegrationType,
      config: updates.config || ((await decryptConfig(updated.config)) as IntegrationConfig),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  });
}

/**
 * Delete an integration
 */
export async function deleteIntegration(integrationId: string, userName: string): Promise<boolean> {
  return await transaction(async (client) => {
    const result = await client.query(
      `
        DELETE FROM uv_integrations
        WHERE id = $1 AND user_name = $2
      `,
      [integrationId, userName],
    );

    return (result.rowCount ?? 0) > 0;
  });
}

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
export function extractIntegrationIds(nodes: WorkflowNodeForValidation[]): string[] {
  const integrationIds: string[] = [];

  for (const node of nodes) {
    const integrationId = node.data?.config?.integrationId;
    if (integrationId && typeof integrationId === 'string') {
      integrationIds.push(integrationId);
    }
  }

  return [...new Set(integrationIds)];
}

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
export async function validateWorkflowIntegrations(
  nodes: WorkflowNodeForValidation[],
  userName: string,
): Promise<{ valid: boolean; invalidIds?: string[] }> {
  const integrationIds = extractIntegrationIds(nodes);

  if (integrationIds.length === 0) {
    return { valid: true };
  }

  return await transaction(async (client) => {
    // Query for ALL integrations with these IDs (regardless of user)
    // to check if any belong to other users
    const result = await client.query<{ id: string; user_name: string }>(
      `
        SELECT id, user_name
        FROM uv_integrations
        WHERE id = ANY($1::uuid[])
      `,
      [integrationIds],
    );

    // Find integrations that exist but belong to a different user
    // (deleted integrations won't appear here, which is fine)
    const invalidIds = result.rows.filter((row) => row.user_name !== userName).map((row) => row.id);

    if (invalidIds.length > 0) {
      return { valid: false, invalidIds };
    }

    return { valid: true };
  });
}
