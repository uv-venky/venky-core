import type { DBRow, Query, StringKeyof, TreeOptions } from '@/lib/core/common/ds/types/filter';
import type { StoreProps, TreeData, TreeStore, TreeStoreState } from '@/lib/core/common/types/Store';
import { storeState } from '@/lib/core/client/state';
import { StoreClass } from '@/lib/core/client/store';

export interface TreeStoreProps<T extends object> extends StoreProps<T>, TreeOptions<T> {}

class TreeStoreClass<T extends object & { level: number; path: string[]; hasChildren: boolean }>
  extends StoreClass<T>
  implements TreeStore<T>
{
  parentAttribute: StringKeyof<T>;
  childAttribute: StringKeyof<T>;
  lazyLoad?: boolean;
  levelAttribute: StringKeyof<T>;
  pathAttribute: StringKeyof<T>;
  hasChildrenAttribute: StringKeyof<T>;
  // will be set when the children are lazy loaded
  parentId?: string;

  constructor({ parentAttribute, childAttribute, lazyLoad, ...props }: TreeStoreProps<T>) {
    super(props);
    this.parentAttribute = parentAttribute;
    this.childAttribute = childAttribute;
    this.lazyLoad = lazyLoad;
    this.levelAttribute = 'level' as StringKeyof<T>;
    this.pathAttribute = 'path' as StringKeyof<T>;
    this.hasChildrenAttribute = 'hasChildren' as StringKeyof<T>;
    storeState.treeState[this.key] = {
      expandedNodes: {},
      loadedNodes: {},
      loadingNodes: {},
      children: {},
      rootNodes: [],
    };
  }

  addNewRowIds = (_rowIds: string[], _rows: DBRow<T>[]) => {
    const treeState = this.getTreeState();
    if (this.parentId) {
      treeState.children[this.parentId].push(..._rowIds);
      for (const row of _rows) {
        const childId = row[this.childAttribute] as string;
        if (!childId) {
          throw new Error(`Missing child id ${this.childAttribute} for row ${row._id} in ${this.alias} store!`);
        }
        if (row.hasChildren) {
          treeState.children[childId] = [];
        }
      }
      return;
    }
    const rowIds = [];
    for (const row of _rows) {
      const parentId = row[this.parentAttribute] as string | undefined;
      const childId = row[this.childAttribute] as string;
      if (!childId) {
        throw new Error(`Missing child id ${this.childAttribute} for row ${row._id} in ${this.alias} store!`);
      }
      if (!parentId) {
        treeState.rootNodes.push(childId);
        rowIds.push(childId);
      } else {
        if (!treeState.children[parentId]) {
          treeState.children[parentId] = [];
        }
        if (!treeState.loadedNodes[parentId]) {
          treeState.loadedNodes[parentId] = true;
        }
        treeState.children[parentId].push(childId);
        if (treeState.expandedNodes[parentId]) {
          rowIds.push(childId);
        }
      }
      if (row.hasChildren) {
        treeState.children[childId] = [];
      }
    }
    this.setRowIds([...this.rowIds(), ...rowIds]);
    this.setOriginalRowIds([...this.originalRowsIds(), ...rowIds]);
  };

  afterAttributeInit() {
    const pks = this.pkAttributes();
    if (pks.length > 1 || pks[0].code !== this.childAttribute) {
      throw new Error(
        `Tree store ${this.alias} must have a single primary key attribute that matches the child attribute '${this.childAttribute}'!`,
      );
    }
  }

  collectChildrenRecursive = (treeState: TreeStoreState, rowIds: string[], rowId: string) => {
    treeState.children[rowId].forEach((childId) => {
      rowIds.push(childId);
      if (treeState.expandedNodes[childId]) {
        // recursively add expanded children
        this.collectChildrenRecursive(treeState, rowIds, childId);
      }
    });
  };

  expandLoadedRow = (rowId: string) => {
    const treeState = this.getTreeState();
    const rowIds: string[] = [];
    this.collectChildrenRecursive(treeState, rowIds, rowId);
    const existingRowIds = this.rowIds();
    const existingRowIdsIndex = existingRowIds.indexOf(rowId);
    existingRowIds.splice(existingRowIdsIndex + 1, 0, ...rowIds);
    const existingOriginalRowIds = this.originalRowsIds();
    const existingOriginalRowIdsIndex = existingOriginalRowIds.indexOf(rowId);
    existingOriginalRowIds.splice(existingOriginalRowIdsIndex + 1, 0, ...rowIds);
  };

  collapseRow = (rowId: string) => {
    const treeState = this.getTreeState();
    treeState.expandedNodes[rowId] = false;
    const rowIds: string[] = [];
    this.collectChildrenRecursive(treeState, rowIds, rowId);
    const existingRowIds = this.rowIds();
    const existingRowIdsIndex = existingRowIds.indexOf(rowId);
    existingRowIds.splice(existingRowIdsIndex + 1, rowIds.length);
    const existingOriginalRowIds = this.originalRowsIds();
    const existingOriginalRowIdsIndex = existingOriginalRowIds.indexOf(rowId);
    existingOriginalRowIds.splice(existingOriginalRowIdsIndex + 1, rowIds.length);
  };

  expandRow = (rowId: string) => {
    const treeState = this.getTreeState();
    const row = this.row(rowId) as T;
    if (!row[this.hasChildrenAttribute]) {
      return;
    }
    if (treeState.loadingNodes[rowId] || treeState.expandedNodes[rowId]) {
      // already loading or expanded
      return;
    }
    treeState.expandedNodes[rowId] = true;
    if (treeState.loadedNodes[rowId]) {
      // already loaded
      this.expandLoadedRow(rowId);
      return;
    }
    treeState.loadingNodes[rowId] = true;
    treeState.loadedNodes[rowId] = true;
    this.executeQuery({
      query: { parentRow: row },
      noClear: true,
      handleResponse: (rows) => {
        this.parentId = rowId;
        this.processServerResponse(rows);
        this.parentId = undefined;
        this.expandLoadedRow(rowId);
      },
    }).finally(() => {
      treeState.loadingNodes[rowId] = false;
    });
  };

  getTreeState(): TreeStoreState {
    return storeState.treeState[this.key];
  }

  async executeQuery(
    {
      query,
      ...rest
    }: {
      query?: Query<T>;
      noClear?: true;
      force?: boolean;
      handleResponse?: (rows: DBRow<T>[]) => void;
    } = { query: {} },
  ) {
    if (!query) {
      query = {};
    }
    query.treeOptions = {
      parentAttribute: this.parentAttribute,
      childAttribute: this.childAttribute,
      lazyLoad: this.lazyLoad,
    };
    storeState.treeState[this.key] = {
      expandedNodes: {},
      loadedNodes: {},
      loadingNodes: {},
      children: {},
      rootNodes: [],
    };
    return super.executeQuery({
      query: {
        ...query,
      },
      ...rest,
    });
  }
}

export function useTreeStore<T extends TreeData>(props: TreeStoreProps<T>): TreeStore<T> {
  let store = StoreClass.get<T>(props);
  if (!store) {
    store = StoreClass.createSync<T>(props, () => new TreeStoreClass(props));
  }
  return store as TreeStoreClass<T>;
}
