/** Leading/trailing trim; whitespace-only becomes undefined (aligns with isEmpty). */
export declare function normalizeTextFieldWhitespace(value: string | undefined): string | undefined;
/** For TextArray post: trim string elements only; preserve cardinality (empty string stays). */
export declare function normalizeTextArrayElementsForPost(arr: unknown[]): unknown[];
//# sourceMappingURL=normalizeTextFieldWhitespace.d.ts.map