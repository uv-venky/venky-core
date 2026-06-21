import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
import { type StatusConfig } from './shared';
export interface StatusBadgeCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the status field */
    attributeCode: StringKeyof<T>;
    /** Map status values to Badge styling */
    statusConfig?: Record<string, StatusConfig>;
    /** Default config when status not in map */
    defaultConfig?: StatusConfig;
    /** Additional class names for the cell */
    cellClassName?: string;
    feedbackMask?: boolean;
}
/**
 * Status badge cell with semantic color mapping.
 *
 * @example
 * ```tsx
 * // With custom config
 * <StatusBadgeCell
 *   attributeCode="status"
 *   statusConfig={{
 *     Active: { variant: 'success' },
 *     Inactive: { variant: 'secondary' },
 *   }}
 *   {...props}
 * />
 *
 * // With default styling (auto-detects common statuses)
 * <StatusBadgeCell attributeCode="status" {...props} />
 * ```
 */
export declare function StatusBadgeCell<T extends object>({ attributeCode, statusConfig, defaultConfig, cellClassName, feedbackMask, row, }: StatusBadgeCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=StatusBadgeCell.d.ts.map