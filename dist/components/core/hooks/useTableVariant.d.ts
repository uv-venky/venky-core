import type { TableVariant } from '../../../components/core/common/types';
/**
 * Resolves the effective table variant:
 * 1. Returns localVariant if provided (per-component override)
 * 2. Falls back to global tableVariant from AppProvider
 * 3. Falls back to 'default'
 */
export declare function useTableVariant(localVariant?: TableVariant): TableVariant;
//# sourceMappingURL=useTableVariant.d.ts.map