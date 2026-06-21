import { storeState } from '../../../lib/core/client/state';
import { StoreClass } from '../../../lib/core/client/store';
class TreeStoreClass extends StoreClass {
    parentAttribute;
    childAttribute;
    lazyLoad;
    levelAttribute;
    pathAttribute;
    hasChildrenAttribute;
    // will be set when the children are lazy loaded
    parentId;
    constructor({ parentAttribute, childAttribute, lazyLoad, ...props }) {
        super(props);
        this.parentAttribute = parentAttribute;
        this.childAttribute = childAttribute;
        this.lazyLoad = lazyLoad;
        this.levelAttribute = 'level';
        this.pathAttribute = 'path';
        this.hasChildrenAttribute = 'hasChildren';
        storeState.treeState[this.key] = {
            expandedNodes: {},
            loadedNodes: {},
            loadingNodes: {},
            children: {},
            rootNodes: [],
        };
    }
    addNewRowIds = (_rowIds, _rows) => {
        const treeState = this.getTreeState();
        if (this.parentId) {
            treeState.children[this.parentId].push(..._rowIds);
            for (const row of _rows) {
                const childId = row[this.childAttribute];
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
            const parentId = row[this.parentAttribute];
            const childId = row[this.childAttribute];
            if (!childId) {
                throw new Error(`Missing child id ${this.childAttribute} for row ${row._id} in ${this.alias} store!`);
            }
            if (!parentId) {
                treeState.rootNodes.push(childId);
                rowIds.push(childId);
            }
            else {
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
            throw new Error(`Tree store ${this.alias} must have a single primary key attribute that matches the child attribute '${this.childAttribute}'!`);
        }
    }
    collectChildrenRecursive = (treeState, rowIds, rowId) => {
        treeState.children[rowId].forEach((childId) => {
            rowIds.push(childId);
            if (treeState.expandedNodes[childId]) {
                // recursively add expanded children
                this.collectChildrenRecursive(treeState, rowIds, childId);
            }
        });
    };
    expandLoadedRow = (rowId) => {
        const treeState = this.getTreeState();
        const rowIds = [];
        this.collectChildrenRecursive(treeState, rowIds, rowId);
        const existingRowIds = this.rowIds();
        const existingRowIdsIndex = existingRowIds.indexOf(rowId);
        existingRowIds.splice(existingRowIdsIndex + 1, 0, ...rowIds);
        const existingOriginalRowIds = this.originalRowsIds();
        const existingOriginalRowIdsIndex = existingOriginalRowIds.indexOf(rowId);
        existingOriginalRowIds.splice(existingOriginalRowIdsIndex + 1, 0, ...rowIds);
    };
    collapseRow = (rowId) => {
        const treeState = this.getTreeState();
        treeState.expandedNodes[rowId] = false;
        const rowIds = [];
        this.collectChildrenRecursive(treeState, rowIds, rowId);
        const existingRowIds = this.rowIds();
        const existingRowIdsIndex = existingRowIds.indexOf(rowId);
        existingRowIds.splice(existingRowIdsIndex + 1, rowIds.length);
        const existingOriginalRowIds = this.originalRowsIds();
        const existingOriginalRowIdsIndex = existingOriginalRowIds.indexOf(rowId);
        existingOriginalRowIds.splice(existingOriginalRowIdsIndex + 1, rowIds.length);
    };
    expandRow = (rowId) => {
        const treeState = this.getTreeState();
        const row = this.row(rowId);
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
    getTreeState() {
        return storeState.treeState[this.key];
    }
    async executeQuery({ query, ...rest } = { query: {} }) {
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
export function useTreeStore(props) {
    let store = StoreClass.get(props);
    if (!store) {
        store = StoreClass.createSync(props, () => new TreeStoreClass(props));
    }
    return store;
}
//# sourceMappingURL=tree-store.js.map