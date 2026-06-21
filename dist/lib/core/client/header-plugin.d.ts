export type HeaderModifier = (headers: Record<string, string>) => void;
declare global {
    var _$venkyHeaderModifiers: HeaderModifier[] | undefined;
}
export declare function registerHeaderModifier(modifier: HeaderModifier): () => void;
export declare function applyHeaderModifiers(headers: Record<string, string>): void;
export declare function clearHeaderModifiers(): void;
//# sourceMappingURL=header-plugin.d.ts.map