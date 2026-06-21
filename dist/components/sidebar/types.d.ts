import type { SidebarIcon } from './icons';
export interface PageItem {
    title: string;
    pagePath: string;
    icon: SidebarIcon;
    retainSearchParams?: boolean;
    hidden?: boolean;
    parentPagePath?: string;
    onClickAction?: SidebarAction;
}
export interface ServerPageItem extends PageItem {
    roles: readonly string[];
    isHidden?: (roles: string[]) => boolean;
}
export interface PageGroup {
    title: string;
    groupPath: string;
    icon: SidebarIcon;
    isExpanded?: boolean;
    pages: PageItem[];
}
export interface ServerPageGroup extends PageGroup {
    pages: ServerPageItem[];
}
export interface ModuleMenuItems {
    title: string;
    modulePath: string;
    pageGroups: PageGroup[];
}
export interface ServerModuleMenuItems extends ModuleMenuItems {
    pageGroups: ServerPageGroup[];
}
export interface Team {
    name: string;
    menuTitle?: string;
    logo: SidebarIcon;
    teamPath: string;
    modules: ModuleMenuItems[];
    oneLevelNav: PageItem[];
}
export interface Application {
    name: string;
    logo: SidebarIcon;
    url: string;
    roles: string[];
}
export interface ServerTeam extends Team {
    modules: ServerModuleMenuItems[];
    oneLevelNav: ServerPageItem[];
}
/**
 * Map of sidebar action names. Consuming projects can extend this via module augmentation:
 *
 * @example
 * // In consuming project's global.d.ts or types file:
 * declare module '../../venky-exports/core/ui/index.js' {
 *   interface SidebarActionMap {
 *     adminConsoleAction: null;
 *   }
 * }
 */
export interface SidebarActionMap {
    createNewChat: null;
}
export type SidebarAction = keyof SidebarActionMap;
//# sourceMappingURL=types.d.ts.map