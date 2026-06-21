import type { ReactNode } from 'react';
/**
 * Consistent empty state for all styled cells
 */
export declare const EMPTY_CELL: import("react/jsx-runtime").JSX.Element;
/**
 * Entity preset type for common entity styling
 */
export type EntityPreset = 'customer' | 'user' | 'project' | 'vendor' | 'document' | 'task';
/**
 * Entity preset configuration
 */
export interface EntityPresetConfig {
    icon: ReactNode;
    iconBgClass: string;
    iconClass: string;
}
/**
 * Predefined styling for common entity types
 */
export declare const ENTITY_PRESETS: Record<EntityPreset, EntityPresetConfig>;
/**
 * Status configuration for StatusBadgeCell
 */
export interface StatusConfig {
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    className?: string;
}
/**
 * Default status configurations for common status values
 */
export declare const STATUS_DEFAULTS: Record<string, StatusConfig>;
//# sourceMappingURL=shared.d.ts.map