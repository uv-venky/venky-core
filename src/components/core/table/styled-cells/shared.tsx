/* Copyright (c) 2024-present Venky Corp. */

import type { ReactNode } from 'react';
import { Building2, CheckSquare, FileText, FolderKanban, Store, User } from 'lucide-react';

/**
 * Consistent empty state for all styled cells
 */
export const EMPTY_CELL = <div className="px-2 py-1 text-muted-foreground text-xs">—</div>;

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
export const ENTITY_PRESETS: Record<EntityPreset, EntityPresetConfig> = {
  customer: {
    icon: <Building2 className="size-3.5" />,
    iconBgClass: 'bg-primary/10',
    iconClass: 'text-primary',
  },
  user: {
    icon: <User className="size-3.5" />,
    iconBgClass: 'bg-blue-500/10',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  project: {
    icon: <FolderKanban className="size-3.5" />,
    iconBgClass: 'bg-purple-500/10',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  vendor: {
    icon: <Store className="size-3.5" />,
    iconBgClass: 'bg-emerald-500/10',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  document: {
    icon: <FileText className="size-3.5" />,
    iconBgClass: 'bg-amber-500/10',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  task: {
    icon: <CheckSquare className="size-3.5" />,
    iconBgClass: 'bg-cyan-500/10',
    iconClass: 'text-cyan-600 dark:text-cyan-400',
  },
};

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
export const STATUS_DEFAULTS: Record<string, StatusConfig> = {
  // Success states
  Active: { variant: 'success' },
  Approved: { variant: 'success' },
  Complete: { variant: 'success' },
  Completed: { variant: 'success' },
  Done: { variant: 'success' },

  // Neutral states
  Inactive: { variant: 'secondary' },
  Draft: { variant: 'secondary' },
  Closed: { variant: 'secondary' },

  // Error states
  Suspended: { variant: 'destructive' },
  Rejected: { variant: 'destructive' },
  Error: { variant: 'destructive' },
  Failed: { variant: 'destructive' },
  Cancelled: { variant: 'destructive' },

  // Warning/pending states
  Pending: { variant: 'warning' },
  Review: { variant: 'warning' },
  'In Progress': { variant: 'warning' },
  InProgress: { variant: 'warning' },
  Processing: { variant: 'warning' },
};
