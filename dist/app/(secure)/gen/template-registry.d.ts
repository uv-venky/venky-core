import type { HandleGenerateFn, TemplateCodeGenFunction } from './types';
declare global {
    var _$venkyCodeGenFunctions: Map<string, HandleGenerateFn> | undefined;
}
export declare function registerCodeGenFunctions(templates: TemplateCodeGenFunction[]): void;
export declare function getCodeGenFunction(value: string): HandleGenerateFn | undefined;
//# sourceMappingURL=template-registry.d.ts.map