import type { TreeData, TreeStore } from '@/lib/core/common/types/Store';
import { useSnapshot } from 'valtio';
import { useRowAtId } from '@/components/core/hooks/useStoreHooks';

export function useIsExpanded<T extends TreeData>(store: TreeStore<T>, id: string): boolean {
  const { expandedNodes } = useSnapshot(store.getTreeState());
  return !!expandedNodes[id];
}

export function useIsExpanding<T extends TreeData>(store: TreeStore<T>, id: string): boolean {
  const { loadingNodes } = useSnapshot(store.getTreeState());
  return !!loadingNodes[id];
}

export function useIsStartEnd<T extends TreeData>(store: TreeStore<T>, id: string): [boolean[], boolean[]] {
  const row = useRowAtId(store, id);
  const { children, rootNodes } = useSnapshot(store.getTreeState());
  if (!row || rootNodes.length === 0) {
    console.warn(`No row or children or rootNodes for ${id}`);
    return [[], []];
  }
  // console.log(`${rootNodes} -- ${JSON.stringify(children)}`);
  const level = row?.level ?? 0;
  let childId = id;
  const isStart = [];
  const isEnd = [];
  let start = false;
  let end = false;
  for (let i = level; i >= 0; i--) {
    const row = store.row(childId);
    const parentId = row[store.parentAttribute] as string | null;
    if (parentId == null) {
      start = rootNodes.indexOf(childId) === 0;
      end = rootNodes.indexOf(childId) === rootNodes.length - 1;
    } else {
      start = children[parentId].indexOf(childId) === 0;
      end = children[parentId].indexOf(childId) === children[parentId].length - 1;
    }
    isStart[i] = start;
    isEnd[i] = end;
    if (i === 0 || parentId == null) {
      break;
    }
    childId = parentId;
  }

  return [isStart, isEnd];
}
