import type { Session } from '../../../auth';
export type CommentContextAuthorizer = (contextId: string, session: Session) => Promise<boolean> | boolean;
declare global {
    var _$commentContextAuthorizers: Map<string, CommentContextAuthorizer> | undefined;
}
export declare function registerCommentContextAuthorizer(context: string, fn: CommentContextAuthorizer): void;
export declare function authorizeCommentAccess(context: string, contextId: string, session: Session): Promise<boolean>;
//# sourceMappingURL=comment-authorizer.d.ts.map