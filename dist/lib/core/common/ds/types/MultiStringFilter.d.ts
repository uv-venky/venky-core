export type MultiStringFilter = {
    hasall: Array<string>;
    ignoreCase?: boolean;
} | {
    hasany: Array<string>;
    ignoreCase?: boolean;
} | {
    notany: Array<string>;
    ignoreCase?: boolean;
} | {
    in: Array<string>;
    ignoreCase?: boolean;
} | {
    nin: Array<string>;
    ignoreCase?: boolean;
};
//# sourceMappingURL=MultiStringFilter.d.ts.map