import type { Session } from '../../../auth';
import type { PgPoolClient } from '../../../lib/core/server/db';
import type { ActionName, ActionOutput, ActionParams } from '.';
export declare function invokeAction<T extends ActionName>(
  client: PgPoolClient,
  session: Session,
  action: T,
  ...args: ActionParams<T>
): Promise<ActionOutput<T>>;
export declare function invokePublicAction<T extends ActionName>(
  client: PgPoolClient,
  action: T,
  ...args: ActionParams<T>
): Promise<ActionOutput<T>>;
//# sourceMappingURL=invoke.d.ts.map
