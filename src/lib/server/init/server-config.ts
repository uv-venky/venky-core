import type { Session, User } from '@/auth';
import type { ServerConfig } from '@/lib/core/server/ServerConfig';

import relayStateProcessors from './relay-state-processors';
import { adminPortal } from '@/components/sidebar/modules/adminPortal';
import type { ServerTeam } from '@/components/sidebar/types';
import { deployConfig, AWS_REGION, GITHUB_REPO_NAME } from '../../config/deploy-config';
import { ACTIONS, ACTION_ACCESS_ROLES, WORKFLOW_CALLABLE_ACTIONS } from '@/lib/server/actions';
import type { ActionRegistry } from '@/lib/server/actions/registry-context';
import { DataSources } from '@/lib/server/ds/defs';

export function validateAccess(_: { session: Session; headers: Headers }): void {
  // const customerNameHeader = headers.get('x-customer-name');
  // if (customerNameHeader) {
  //   validateCustomerAccess(session, customerNameHeader);
  //   session.user.customerName = customerNameHeader;
  // }
}

export function validateProfileUpdate(_key: string, _value: string | boolean | undefined, _user: User): void {
  // if (key === 'customerName') {
  //   const roles = rolesByCustomer[value as keyof typeof rolesByCustomer];
  //   if (!roles.some((role) => user.roles.includes(role))) {
  //     throw new Error('User is not authorized to update customer information');
  //   }
  // }
}

function buildTeams(): ServerTeam[] {
  return [adminPortal];
}

const serverConfig: ServerConfig = {
  validateAccess,
  validateProfileUpdate,
  teams: buildTeams(),
  dataSources: DataSources,
  jobs: [],
  templateCodeGenFunctions: [],
  relayStateProcessors,
  deployConfig,
  awsRegion: AWS_REGION,
  gitHubRepoName: GITHUB_REPO_NAME,
  actionRegistry: {
    ACTIONS: ACTIONS as ActionRegistry['ACTIONS'],
    ACTION_ACCESS_ROLES: ACTION_ACCESS_ROLES as ActionRegistry['ACTION_ACCESS_ROLES'],
    WORKFLOW_CALLABLE_ACTIONS,
  },
};

export default serverConfig;
