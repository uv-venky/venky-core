import { jsx as _jsx } from "react/jsx-runtime";
import { Building2, CheckSquare, FileText, FolderKanban, Store, User } from 'lucide-react';
/**
 * Consistent empty state for all styled cells
 */
export const EMPTY_CELL = _jsx("div", { className: "px-2 py-1 text-muted-foreground text-xs", children: "\u2014" });
/**
 * Predefined styling for common entity types
 */
export const ENTITY_PRESETS = {
    customer: {
        icon: _jsx(Building2, { className: "size-3.5" }),
        iconBgClass: 'bg-primary/10',
        iconClass: 'text-primary',
    },
    user: {
        icon: _jsx(User, { className: "size-3.5" }),
        iconBgClass: 'bg-blue-500/10',
        iconClass: 'text-blue-600 dark:text-blue-400',
    },
    project: {
        icon: _jsx(FolderKanban, { className: "size-3.5" }),
        iconBgClass: 'bg-purple-500/10',
        iconClass: 'text-purple-600 dark:text-purple-400',
    },
    vendor: {
        icon: _jsx(Store, { className: "size-3.5" }),
        iconBgClass: 'bg-emerald-500/10',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    document: {
        icon: _jsx(FileText, { className: "size-3.5" }),
        iconBgClass: 'bg-amber-500/10',
        iconClass: 'text-amber-600 dark:text-amber-400',
    },
    task: {
        icon: _jsx(CheckSquare, { className: "size-3.5" }),
        iconBgClass: 'bg-cyan-500/10',
        iconClass: 'text-cyan-600 dark:text-cyan-400',
    },
};
/**
 * Default status configurations for common status values
 */
export const STATUS_DEFAULTS = {
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
//# sourceMappingURL=shared.js.map