import type { Store, StoreState, TreeStoreState } from '../../../lib/core/common/types/Store';
import type { Attribute } from '../../../lib/core/common/ds/types/Attribute';
import type { UserAvatar } from '../../../lib/common/ds/types/core/UserAvatar';
type GlobalState = {
    global: Record<string, any>;
    userAvatars: Record<string | number, UserAvatar | {
        isLoading: boolean;
    }>;
    trackId: string;
};
export declare const globalState: GlobalState;
export declare function getTrackId(): string;
export declare function resetTrackId(): void;
export declare function useUserAvatar(username?: string | number): UserAvatar | {
    isLoading: boolean;
};
export declare function putUserAvatar(userId: string | number, userAvatar: UserAvatar): void;
export declare function useGlobalSnapshot<T>(key: string, initializeStateCallback: () => T): T;
export declare function getOrCreateGlobalState<T>(key: string, initializeStateCallback: () => T): T;
export declare function getGlobalState<T>(key: string): T;
type State = {
    data: Record<string, StoreState<any>>;
    attributes: Record<string, Attribute<any>[]>;
    pkAttributes: Record<string, Attribute<any>[]>;
    treeState: Record<string, TreeStoreState>;
};
export declare const storeState: State;
export declare const hashState: {
    hash: {
        current: URLSearchParams;
        previous: URLSearchParams;
        pathname: string;
    };
};
export declare const STORE_CACHE: Map<string, Store<any>>;
export {};
//# sourceMappingURL=state.d.ts.map