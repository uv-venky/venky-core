import { ServerClass } from './ServerClass';
export function getServer(_name) {
  if (globalThis._$venkyServer) {
    return globalThis._$venkyServer;
  }
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test') {
    return new ServerClass({
      teams: [],
      validateAccess: () => {},
      validateProfileUpdate: () => {},
      dataSources: {},
      jobs: [],
      templateCodeGenFunctions: [],
      relayStateProcessors: [],
      chatAgents: {},
      userPropertyCallbacks: undefined,
      actionRegistry: {
        ACTIONS: {},
        ACTION_ACCESS_ROLES: {},
        WORKFLOW_CALLABLE_ACTIONS: [],
      },
    });
  }
  throw new Error(`Server not initialized: ${_name}`);
}
//# sourceMappingURL=getServer.js.map
