import type { Column } from './types';
/**
 * Normalize `pg_catalog.format_type()` output for mapping (e.g.
 * `public.character varying(128)` → base `character varying`; `numeric(5,3)` → `numeric`).
 */
export declare function normalizePgTypeBase(pgType: string): {
    base: string;
    isArray: boolean;
};
export declare function canBePrimaryKey(pgType: string, maxLength?: number): boolean;
export declare function getAttributeType(pgType: string, maxLength: number): "JSON" | "UUID" | "Text" | "TextArray" | "Boolean" | "Date" | "Number" | "YN" | "Time" | "Polygon" | "Vector" | null;
export declare function getAttributes(columns: Column[], index?: number): string;
export declare function getInterfaceFields(columns: Column[], index?: number): {
    fields: string;
    hasYNField: boolean;
    hasDateTime: boolean;
    hasDate: boolean;
    hasTime: boolean;
};
export declare function getDefaultOperatorForType(type: string): "is" | "on" | "eq" | "istrue";
//# sourceMappingURL=utils.d.ts.map