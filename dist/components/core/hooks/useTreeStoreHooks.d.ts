import type { TreeData, TreeStore } from '../../../lib/core/common/types/Store';
export declare function useIsExpanded<T extends TreeData>(store: TreeStore<T>, id: string): boolean;
export declare function useIsExpanding<T extends TreeData>(store: TreeStore<T>, id: string): boolean;
export declare function useIsStartEnd<T extends TreeData>(store: TreeStore<T>, id: string): [boolean[], boolean[]];
//# sourceMappingURL=useTreeStoreHooks.d.ts.map