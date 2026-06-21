import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
import { type EntityPreset } from './shared';
export interface CompoundCellProps<T extends object> extends CellContext<T, unknown> {
    /** Primary field (larger, main text) */
    primary: StringKeyof<T>;
    /** Secondary field (smaller, muted text) */
    secondary?: StringKeyof<T>;
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
 * Compound cell with primary and secondary text, optional icon.
 *
 * @example
 * ```tsx
 * // Name with email subtitle
 * <CompoundCell
 *   primary="displayName"
 *   secondary="email"
 *   preset="user"
 *   useTableOnEdit
 *   {...props}
 * />
 *
 * // Project with customer
 * <CompoundCell
 *   primary="projectName"
 *   secondary="customerName"
 *   preset="project"
 *   {...props}
 * />
 * ```
 */
export declare function CompoundCell<T extends object>({ primary, secondary, preset, icon, iconBgClass, iconClass, onClick, useTableOnEdit, className, feedbackMask, row, table, }: CompoundCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CompoundCell.d.ts.map