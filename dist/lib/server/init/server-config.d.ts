import type { Session, User } from '../../../auth';
import type { ServerConfig } from '../../../lib/core/server/ServerConfig';
export declare function validateAccess(_: {
    session: Session;
    headers: Headers;
}): void;
export declare function validateProfileUpdate(_key: string, _value: string | boolean | undefined, _user: User): void;
declare const serverConfig: ServerConfig;
export default serverConfig;
//# sourceMappingURL=server-config.d.ts.map