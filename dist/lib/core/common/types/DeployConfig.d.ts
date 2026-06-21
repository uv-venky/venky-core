/**
 * Deploy Configuration Types
 *
 * These types define the structure for deployment configuration.
 * Consuming projects must provide their own deployConfig values via:
 * - ServerConfig for server-side usage
 * - AppProvider props for client-side usage
 *
 * See .cursor/rules/config-externalization-pattern.mdc for the pattern.
 */
/** Supported deployment environments */
export type DeployEnvironment = 'DEV' | 'UAT' | 'PROD' | 'PRODCLONE' | 'DEMO';
/** Configuration for a single deployment environment */
export interface DeployConfig {
    /** AWS ECS cluster name */
    clusterName: string;
    /** AWS ECS service name */
    serviceName: string;
    /** Human-readable label for the environment */
    label: string;
}
/** Map of environment to deployment configuration */
export type DeployConfigMap = Partial<Record<DeployEnvironment, DeployConfig>>;
//# sourceMappingURL=DeployConfig.d.ts.map