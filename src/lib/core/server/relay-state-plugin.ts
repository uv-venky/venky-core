/* Copyright (c) 2024-present Venky Corp. */

import type { PgPoolClient } from '@/lib/core/server/db';
import { assignRolesToUser } from '@/lib/core/server/user';
import { transaction, executeQuery } from '@/lib/core/server/db';
import logger from '@/lib/core/server/logger';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';

export interface RelayStateContext {
  /** The relayState URL string */
  relayState: string;
  url: URL;
  /** URL path segments (e.g., ['dashboard', 'folder', 'subfolder']) */
  segments: string[];
  userName: string;
  cloudioRoles?: string[];
}

export interface RelayStateProcessorResult {
  /** Roles to assign to the user */
  roles: string[];
  /** Whether to check cloudioRoles before assigning (if cloudioRoles is provided) */
  checkCloudioRoles?: boolean;
  /** Cloudio role names to check against (if checkCloudioRoles is true) */
  cloudioRoleNames?: string[];
}

export type RelayStateProcessor = (context: RelayStateContext) => Promise<RelayStateProcessorResult | null | undefined>;

declare global {
  var _$venkyRelayStateProcessors: RelayStateProcessor[] | undefined;
}

function getRelayStateProcessors(): RelayStateProcessor[] {
  if (!globalThis._$venkyRelayStateProcessors) {
    globalThis._$venkyRelayStateProcessors = [];
  }
  return globalThis._$venkyRelayStateProcessors;
}

export function registerRelayStateProcessor(processor: RelayStateProcessor): void {
  const processors = getRelayStateProcessors();
  processors.push(processor);
}

async function getUserRoles(userName: string): Promise<string[]> {
  const appId = getConfig('relayState.getUserRoles').appId;
  const rolesResult = await executeQuery<{
    role_code: string;
  }>(
    `SELECT
      r.role_code
    FROM ${PREFIX}user_roles ur, ${PREFIX}roles r 
    WHERE ur.role_code = r.role_code 
      AND ur.user_name = $1 
      AND ur.start_date <= now() 
      AND (ur.end_date IS NULL OR ur.end_date >= now()) 
      AND r.start_date <= now() 
      AND (r.end_date IS NULL OR r.end_date >= now())
      AND ur.app_id = $2
      AND r.app_id = $2`,
    [userName, appId],
  );
  return rolesResult.rows.map((r) => r.role_code);
}

export async function processRelayState(relayState: string, userName: string, cloudioRoles?: string[]): Promise<void> {
  const processors = getRelayStateProcessors();
  if (processors.length === 0) {
    return;
  }

  try {
    const url = new URL(relayState, process.env.APP_URL ?? 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);

    const context: RelayStateContext = {
      relayState,
      url,
      segments,
      userName,
      cloudioRoles,
    };

    // Process with all registered processors
    for (const processor of processors) {
      try {
        const result = await processor(context);
        if (result?.roles && result.roles.length > 0) {
          const existingRoles = await getUserRoles(userName);
          const rolesToAssign = result.roles.filter((role) => !existingRoles.includes(role));

          if (rolesToAssign.length > 0) {
            // Check cloudio roles if required
            let shouldAssign = true;
            if (result.checkCloudioRoles && cloudioRoles && result.cloudioRoleNames) {
              shouldAssign = result.cloudioRoleNames.some((name) => cloudioRoles.includes(name));
            }

            if (shouldAssign) {
              await transaction(async (client: PgPoolClient) => {
                await assignRolesToUser(client, {
                  createdBy: userName,
                  roles: rolesToAssign,
                  userName,
                });
              });
            }
          }
        }
      } catch (err) {
        logger.error('Error in relayState processor', err);
        // Continue processing other processors even if one fails
      }
    }
  } catch (err) {
    logger.error('Error processing relayState', err);
  }
}
