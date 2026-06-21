import type { TreeOptions } from '../../../lib/core/common/ds/types/filter';
import type { StoreProps, TreeData, TreeStore } from '../../../lib/core/common/types/Store';
export interface TreeStoreProps<T extends object> extends StoreProps<T>, TreeOptions<T> {
}
export declare function useTreeStore<T extends TreeData>(props: TreeStoreProps<T>): TreeStore<T>;
//# sourceMappingURL=tree-store.d.ts.map