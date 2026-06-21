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
export declare function registerRelayStateProcessor(processor: RelayStateProcessor): void;
export declare function processRelayState(relayState: string, userName: string, cloudioRoles?: string[]): Promise<void>;
//# sourceMappingURL=relay-state-plugin.d.ts.map
