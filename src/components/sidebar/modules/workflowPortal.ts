import type { ServerTeam } from '@/components/sidebar/types';
import { adminModules } from './admin';

export const workflowPortal: ServerTeam = {
  name: 'Workflows',
  logo: 'MiniLogo',
  teamPath: '/workflows',
  modules: adminModules,
  oneLevelNav: [
    {
      title: 'List',
      pagePath: '/list',
      icon: 'LayoutList',
      roles: ['admin', 'workflow'],
    },
    {
      title: 'Runs',
      pagePath: '/runs',
      icon: 'ListChecks',
      roles: ['admin', 'workflow'],
    },
    {
      title: 'Pending approvals',
      pagePath: '/approvals',
      icon: 'ClipboardList',
      roles: ['admin', 'workflow'],
    },
    {
      title: 'Edit Workflow',
      pagePath: '/',
      icon: 'Bot',
      roles: ['admin', 'workflow'],
      hidden: true,
    },
  ],
};
