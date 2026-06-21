import type { PgPoolClient } from '../../../lib/core/server/db';
interface CreateTinyUrlParams {
    client: PgPoolClient;
    userName: string;
    url: string;
    expiresAt?: string;
    isPublic?: boolean;
}
export declare function createTinyUrl({ client, userName, url, expiresAt, isPublic, }: CreateTinyUrlParams): Promise<string>;
interface GetOriginalUrlParams {
    client: PgPoolClient;
    shortId: string;
}
export declare function getOriginalUrl({ client, shortId }: GetOriginalUrlParams): Promise<string>;
export {};
//# sourceMappingURL=tinyUrls.d.ts.map