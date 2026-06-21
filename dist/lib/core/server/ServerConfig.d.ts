import type { DBUser, Session, User } from '../../../auth';
import type { ServerTeam } from '../../../components/sidebar/types';
import type { DataSource } from '../common/ds/types/DataSource';
import type { JobEntry } from '../../../lib/server/jobs/registry';
import type { TemplateCodeGenFunction } from '../../../app/(secure)/gen/types';
import type { RelayStateProcessor } from '../../../lib/core/server/relay-state-plugin';
import type { DeployConfigMap } from '../../../lib/core/common/types/DeployConfig';
import type { ActionRegistry } from '../../../lib/server/actions/registry-context';
import type { RequestContextProvider } from '../../../lib/core/server/request-context';
import type { RedirectImplementation } from '../../../lib/core/server/redirect';
/** Stub type for consuming projects that still wire chat agents. Not used in venky-core. */
export type ChatAgentServerType = Record<string, unknown>;
/** Stub type for consuming projects that still wire workflow plugins. Not used in venky-core. */
export type WorkflowServerPlugin = Record<string, unknown>;
/**
 * Callbacks for customizing user property extraction from database settings.
 * These allow consuming projects to customize how custom properties are extracted
 * from the settings JSONB column and mapped to the User object.
 */
export interface UserPropertyCallbacks {
  /**
   * Maps custom database fields to User object properties.
   * @param dbUser - The database user object with all fields including custom ones
   * @returns Partial User object with custom properties
   */
  mapCustomUserProperties?: (dbUser: DBUser) => Partial<User>;
}
export interface ServerConfig {
  teams: ServerTeam[];
  validateAccess: (props: { session: Session; headers: Headers }) => void;
  validateProfileUpdate: (key: string, value: string | boolean | undefined, user: User) => void;
  dataSources: Record<string, DataSource<any>>;
  jobs: JobEntry[];
  templateCodeGenFunctions?: TemplateCodeGenFunction[];
  /** Optional chat agent registry for consuming projects with chat features. */
  chatAgents?: Record<string, ChatAgentServerType>;
  relayStateProcessors: RelayStateProcessor[];
  userPropertyCallbacks?: UserPropertyCallbacks;
  /** AWS ECS deployment configuration per environment */
  deployConfig?: DeployConfigMap;
  /** AWS region for deployments (defaults to 'us-east-1') */
  awsRegion?: string;
  /** GitHub repository name for GitHub Actions links (e.g., 'uv-venky/metro-one-cop') */
  gitHubRepoName?: string;
  /** Subject for new user welcome email (external users). Default: 'Welcome To Metro One Dashboard' */
  newUserEmailSubject?: string;
  /** Subject for new user welcome email (internal users). Default: 'Welcome To Metro One Dashboard' */
  newUserEmailSubjectInternal?: string;
  /** Optional workflow plugins for consuming projects with workflow features. */
  workflowPlugins?: WorkflowServerPlugin[];
  /**
   * Action registry for server action invocation.
   * Required: every project must provide ACTIONS, ACTION_ACCESS_ROLES, and WORKFLOW_CALLABLE_ACTIONS.
   * Consuming projects must merge core actions (e.g. coreActions from venky-core/server) with their own.
   */
  actionRegistry: ActionRegistry;
  /** Request context provider for cookie/header access. Defaults to Next.js implementation. */
  requestContextProvider?: RequestContextProvider;
  /** Server redirect implementation. Defaults to Next.js redirect when not specified. */
  redirectImplementation?: RedirectImplementation;
  /**
   * Optional hook for consuming projects to wire an AI model registry.
   * Not used in venky-core.
   */
  configureModelRegistry?: () => void | Promise<void>;
}
//# sourceMappingURL=ServerConfig.d.ts.map
