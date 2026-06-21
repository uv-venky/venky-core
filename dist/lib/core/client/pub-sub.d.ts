import type { StoreIdentifier } from '../../../lib/core/common/types/Store';
export interface EventMap {
    [key: string]: Record<string, unknown>;
}
export interface PubSub<T = EventMap> {
    destroy(): void;
    pub<K extends keyof T>(event: K, props: T[K], deferrable?: boolean, deferrableOnce?: boolean): Promise<void>;
    sub<K extends keyof T>(event: K | K[], listener: <E extends K>(event: E, props: T[E]) => Promise<void>, deferrable?: boolean, deferrableOnce?: boolean): () => void;
}
export declare class PubSubClass<T = EventMap> implements PubSub<T> {
    map: Map<keyof T, (<K extends keyof T>(event: K, props: T[K]) => Promise<void>)[]>;
    set: Set<string>;
    count: Map<keyof T, number>;
    data: Map<keyof T, unknown>;
    destroy: () => void;
    pub: <K extends keyof T>(event: K, props: T[K], deferrable?: boolean, deferrableOnce?: boolean) => Promise<void>;
    sub: <K extends keyof T>(event: K | K[], listener: <E extends K>(_event: E, props: T[E]) => Promise<void>, deferrable?: boolean, deferrableOnce?: boolean) => (() => void);
}
/**
 * Global event map for cross-store communication
 */
export interface GlobalEventMap {
    /** Fired when a datasource has changes (insert/update/delete) */
    OnDataSourceChange: {
        datasourceId: string;
        sourceStoreKey: string;
        action: 'insert' | 'update' | 'delete' | 'mixed';
    };
    /** Fired to invalidate/refresh stores matching the given identifiers */
    OnStoreInvalidate: {
        identifiers: StoreIdentifier[];
        sourceStoreKey?: string;
    };
}
export declare const globalPubSub: PubSubClass<GlobalEventMap>;
//# sourceMappingURL=pub-sub.d.ts.map