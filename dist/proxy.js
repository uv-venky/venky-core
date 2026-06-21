/* Copyright (c) 2024-present Venky Corp. */
import { init_CallThisOnlyFromCoreProxy as init } from './lib/server/init/init';
import logger from './lib/core/server/logger';
import { proxyCore } from './proxyCore';
let initialized = false;
export default async function proxy(req) {
  if (!initialized) {
    await init();
    logger.info('Initializing proxy core');
    initialized = true;
  }
  return proxyCore(req);
}
export const config = {
  matcher: [
    '/((?!api/auth|robots.txt|.well-known/appspecific|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.ico$|.*\\.webp$|.*\\.svg$).*)',
  ],
};
//# sourceMappingURL=proxy.js.map
