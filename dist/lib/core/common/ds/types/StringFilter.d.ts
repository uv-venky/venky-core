export type StringFilter = {
    is: string;
    ignoreCase?: boolean;
} | {
    not: string;
    ignoreCase?: boolean;
} | {
    empty: string;
} | {
    notempty: string;
} | {
    nct: string;
    ignoreCase?: boolean;
} | {
    like: string;
    ignoreCase?: boolean;
} | {
    sw: string;
    ignoreCase?: boolean;
} | {
    ew: string;
    ignoreCase?: boolean;
} | {
    slt: string;
} | {
    sgt: string;
};
//# sourceMappingURL=StringFilter.d.ts.map