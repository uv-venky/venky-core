import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
import { type EntityPreset } from './shared';
export interface EntityNameCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the name field */
    attributeCode: StringKeyof<T>;
    /** Preset entity type for icon and colors */
    preset?: EntityPreset;
    /** Custom icon component (overrides preset) */
    icon?: ReactNode;
    /** Background color class for icon container (overrides preset) */
    iconBgClass?: string;
    /** Icon color class (overrides preset) */
    iconClass?: string;
    /** Click handler - if provided, name becomes clickable */
    onClick?: (rowId: string) => void;
    /** Use table.options.meta?.onEdit instead of onClick */
    useTableOnEdit?: boolean;
    /** Additional class names for the cell */
    className?: string;
    feedbackMask?: boolean;
}
/**
 * Entity name cell with icon and optional click behavior.
 *
 * @example
 * ```tsx
 * // With preset
 * <EntityNameCell preset="customer" attributeCode="customerName" useTableOnEdit {...props} />
 *
 * // With custom icon and colors
 * <EntityNameCell
 *   attributeCode="name"
 *   icon={<User className="size-3.5" />}
 *   iconBgClass="bg-indigo-100 dark:bg-indigo-900"
 *   iconClass="text-indigo-600 dark:text-indigo-400"
 *   onClick={(rowId) => router.push(`/users/${rowId}`)}
 *   {...props}
 * />
 * ```
 */
export declare function EntityNameCell<T extends object>({ attributeCode, preset, icon, iconBgClass, iconClass, onClick, useTableOnEdit, className, feedbackMask, row, table, }: EntityNameCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EntityNameCell.d.ts.map