/* Copyright (c) 2024-present Venky Corp. */
import { getErrorMessage } from '../../../lib/core/common/error';
import { newReadOnlyClient } from '../../../lib/core/server/db';
import { auth } from '../../../auth';
import { getRequestContext } from './request-context';
import { getServer } from './getServer';
/**
 * Server action wrapper that provides a readonly DB client.
 * No BEGIN/COMMIT — the readonly pool already sets default_transaction_read_only
 * at the session level, and autocommit is sufficient for read-only work.
 */
export const withReadOnlyDBSessionAction = (callback) => {
  return async function action(...args) {
    const session = await auth();
    if (!session) {
      return { status: 'ERROR', message: 'Unauthorized' };
    }
    const ctx = getRequestContext('withReadOnlyDBSessionAction');
    const h = await ctx.getHeaders();
    getServer('withReadOnlyDBSessionAction').config.validateAccess({ session, headers: h });
    const client = await newReadOnlyClient();
    try {
      return await callback(client, session, ...args);
    } catch (error) {
      return { status: 'ERROR', message: getErrorMessage(error) };
    } finally {
      client.release();
    }
  };
};
export const withReadOnlyDBAction = (callback) => {
  return async function action(...args) {
    const client = await newReadOnlyClient();
    try {
      return await callback(client, ...args);
    } catch (error) {
      return { status: 'ERROR', message: getErrorMessage(error) };
    } finally {
      client.release();
    }
  };
};
//# sourceMappingURL=withReadOnlyDBActions.js.map
