import { addJobs } from '../../../lib/server/jobs/registry';
import { registerRelayStateProcessor } from '../../../lib/core/server/relay-state-plugin';
import { addDataSources } from '../../../lib/server/ds/defs/ds';
import { registerCodeGenFunctions } from '../../../app/(secure)/gen/template-registry';
import { setActionRegistry } from '../../../lib/server/actions/registry-context';
import { setRequestContextProvider } from './request-context';
import { setRedirectImplementation } from './redirect';
import { ServerClass } from './ServerClass';
import logger from './logger';
// ServerClass is exported from ServerClass.ts to avoid circular dependencies
export { ServerClass } from './ServerClass';
const isDev = process.env.NODE_ENV === 'development';
export async function initializeServer(config) {
  // Set the request context provider (lazy-import Next.js default to avoid pulling in next/headers in non-Next.js projects)
  if (config.requestContextProvider) {
    logger.info('Setting request context provider from config');
    setRequestContextProvider(config.requestContextProvider);
  } else {
    logger.info('Setting nextjs request context provider from default');
    const { nextjsRequestContext } = await import('./request-context-nextjs');
    setRequestContextProvider(nextjsRequestContext);
  }
  if (config.redirectImplementation) {
    logger.info('Setting redirect implementation from config');
    setRedirectImplementation(config.redirectImplementation);
  } else {
    logger.info('Setting nextjs redirect implementation from default');
    const { nextjsRedirectImplementation } = await import('./redirect-nextjs');
    setRedirectImplementation(nextjsRedirectImplementation);
  }
  const server = new ServerClass(config);
  // Set the global server instance
  globalThis._$venkyServer = server;
  // In dev mode, reload DataSources to pick up changes without server restart
  await addDataSources(config.dataSources, { reload: isDev });
  await addJobs(config.jobs);
  if (config.templateCodeGenFunctions) {
    registerCodeGenFunctions(config.templateCodeGenFunctions);
  }
  if (config.relayStateProcessors) {
    config.relayStateProcessors.forEach((processor) => {
      registerRelayStateProcessor(processor);
    });
  }
  setActionRegistry(config.actionRegistry);
}
// Re-export getServer from getServer.ts to avoid circular dependencies
export { getServer } from './getServer';
//# sourceMappingURL=Server.js.map
