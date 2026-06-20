'use client';

import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Camera,
  ChartBar,
  ChartLine,
  ChartNoAxesCombined,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  ClockAlert,
  Coffee,
  Command,
  Contact,
  Database,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileChartPie,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FileUser,
  GalleryVerticalEnd,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  Hourglass,
  Inbox,
  LayoutDashboard,
  LayoutList,
  LineChart,
  ListChecks,
  Mail,
  MapPin,
  MessageSquareCode,
  Monitor,
  MousePointer,
  Network,
  Package,
  Palette,
  Plus,
  Receipt,
  Route,
  Scale,
  Server,
  Settings2,
  Shield,
  ShieldUser,
  ShoppingCart,
  Sparkles,
  Store,
  Table,
  Table2,
  Target,
  TentTree,
  TimerReset,
  TrendingUp,
  Truck,
  UserCog,
  UserMinus,
  UserPlus,
  UserSearch,
  UserX,
  Users,
  Video,
  Wallet,
  Warehouse,
  Waypoints,
  Zap,
  MemoryStick,
  MessageSquarePlus,
} from 'lucide-react';
import { MiniLogo } from '@/app/login/mini-logo';
import useTheme from '../core/hooks/useTheme';
import { useAppContext } from './app-provider';

export const appSidebarIcons = {
  MemoryStick,
  MessageSquarePlus,
  Activity,
  AlertTriangle,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Camera,
  ChartBar,
  ChartLine,
  ChartNoAxesCombined,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  ClockAlert,
  Coffee,
  Command,
  Contact,
  Database,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileChartPie,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FileUser,
  GalleryVerticalEnd,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  Hourglass,
  Inbox,
  LayoutDashboard,
  LayoutList,
  LineChart,
  ListChecks,
  Mail,
  MapPin,
  MessageSquareCode,
  Monitor,
  MousePointer,
  Network,
  Package,
  Palette,
  Plus,
  Receipt,
  Route,
  Scale,
  Server,
  Settings2,
  Shield,
  ShieldUser,
  ShoppingCart,
  Sparkles,
  Store,
  Table,
  Table2,
  Target,
  TentTree,
  TimerReset,
  TrendingUp,
  Truck,
  UserCog,
  UserMinus,
  UserPlus,
  UserSearch,
  UserX,
  Users,
  Video,
  Wallet,
  Warehouse,
  Waypoints,
  Zap,
};

/** Option row for icon pickers (e.g. Command Center domain settings). */
export interface AppSidebarIconOption {
  value: keyof typeof appSidebarIcons;
  label: string;
}

function sidebarIconPickerLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').trim();
}

/** Sorted keys from {@link appSidebarIcons} — same set as the app sidebar. */
export const APP_SIDEBAR_ICON_OPTIONS: readonly AppSidebarIconOption[] = (
  Object.keys(appSidebarIcons) as (keyof typeof appSidebarIcons)[]
)
  .map((value) => ({ value, label: sidebarIconPickerLabel(value) }))
  .sort((a, b) => a.label.localeCompare(b.label));

export type AppSidebarIcon = keyof typeof appSidebarIcons | 'MiniLogo';

/**
 * Augment this interface to add custom sidebar icon names.
 * Keys must match customSidebarIcons passed to AppProvider.
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty for module augmentation
export interface SidebarIconRegistry {}

export type SidebarIcon = AppSidebarIcon | keyof SidebarIconRegistry;

export function AppIcon({ icon, className }: { icon: SidebarIcon; className?: string }) {
  const { theme } = useTheme();
  const { customMiniLogo, customSidebarIcons } = useAppContext();

  if (icon === 'MiniLogo') {
    const LogoComponent = customMiniLogo || MiniLogo;
    return (
      <LogoComponent className={cn('size-8 shrink-0', className)} fill={theme === 'dark' ? '#ffffff' : '#512eff'} />
    );
  }
  const customIcons = customSidebarIcons ?? {};
  const customIcon = (customIcons as Record<string, (props: { className?: string }) => React.ReactElement>)[icon];
  const coreIcon = icon in appSidebarIcons ? appSidebarIcons[icon as keyof typeof appSidebarIcons] : undefined;
  const Icon = customIcon ?? coreIcon;
  if (!Icon) {
    // Fallback to Network icon if icon is not found
    const FallbackIcon = appSidebarIcons.Network;
    return <FallbackIcon className={cn('size-4 shrink-0', className)} />;
  }
  return <Icon className={cn('size-4 shrink-0', className)} />;
}
