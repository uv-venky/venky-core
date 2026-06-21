export const DefaultDataSource = {
    type: 'Table',
    logLevel: 'ERROR',
    skipQueryForUpdate: false,
    readOnly: false,
    rowType: [],
};
export const DefaultAttribute = {
    type: 'Text',
    insert: true,
    update: true,
    select: true,
    export: true,
    query: true,
    audit: true,
    optional: true,
};
export const DefaultCalculatedAttribute = {
    type: 'Text',
    insert: false,
    update: false,
    select: true,
    export: true,
    query: true,
    audit: false,
    optional: true,
    calculated: true,
};
export const DefaultFullAccess = {
    query: true,
    insert: true,
    update: true,
    delete: true,
    export: true,
};
export const DefaultReadOnlyAccess = {
    query: true,
};
//# sourceMappingURL=Defaults.js.map