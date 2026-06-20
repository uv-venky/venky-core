import type { ServerModuleMenuItems } from '@/components/sidebar/types';

export const adminModules: ServerModuleMenuItems[] = [
  {
    title: 'Administration',
    modulePath: '/admin',
    pageGroups: [
      {
        title: 'Config',
        groupPath: '/config',
        icon: 'Settings2',
        pages: [
          {
            title: 'Apps',
            pagePath: '/apps',
            icon: 'MiniLogo',
            roles: ['admin'],
          },
          {
            title: 'Code Generator',
            pagePath: '/gen',
            icon: 'Bot',
            roles: ['admin'],
          },
          {
            title: 'Lookups',
            pagePath: '/lookups',
            icon: 'ListChecks',
            roles: ['admin'],
          },
          {
            title: 'Roles',
            pagePath: '/roles',
            icon: 'Shield',
            roles: ['admin'],
          },
          {
            title: 'Themes',
            pagePath: '/themes',
            icon: 'Palette',
            roles: ['admin'],
          },
          {
            title: 'Users',
            pagePath: '/users',
            icon: 'Users',
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'Monitoring',
        groupPath: '/monitoring',
        icon: 'Monitor',
        pages: [
          {
            title: 'Activity Monitor',
            pagePath: '/activity',
            icon: 'Activity',
            roles: ['admin'],
          },
          {
            title: 'API Playground',
            pagePath: '/api-playground',
            icon: 'Zap',
            roles: ['admin', 'debug'],
            isHidden: (roles: string[]) => !roles.includes('admin'),
          },
          {
            title: 'Audit',
            pagePath: '/audit',
            icon: 'FileText',
            roles: ['admin'],
          },
          {
            title: 'Domain Audit',
            pagePath: '/domain-audit',
            icon: 'Shield',
            roles: ['admin', 'compliance'],
          },
          {
            title: 'Cache',
            pagePath: '/cache',
            icon: 'Store',
            roles: ['admin'],
          },
          {
            title: 'DB Logs',
            pagePath: '/db-logs',
            icon: 'FileText',
            roles: ['admin', 'debug'],
          },
          {
            title: 'Deployments',
            pagePath: '/deployments',
            icon: 'Package',
            roles: ['admin'],
            hidden: true,
          },
          {
            title: 'Email Requests',
            pagePath: '/email-requests',
            icon: 'Mail',
            roles: ['admin'],
          },
          {
            title: 'Health',
            pagePath: '/health',
            icon: 'HeartPulse',
            roles: ['admin'],
          },
          {
            title: 'Jobs',
            pagePath: '/jobs',
            icon: 'TimerReset',
            roles: ['admin'],
          },
          {
            title: 'Memory Samples',
            pagePath: '/memory-samples',
            icon: 'MemoryStick',
            roles: ['admin'],
          },
          {
            title: 'SQL Browser',
            pagePath: '/sql-browser',
            icon: 'Database',
            roles: ['admin'],
          },
          {
            title: 'User Activity',
            pagePath: '/user-activity',
            icon: 'Eye',
            roles: ['admin'],
          },
          {
            title: 'User Activity History',
            pagePath: '/user-activity-history',
            icon: 'Clock',
            roles: ['admin'],
          },
          {
            title: 'User Sessions',
            pagePath: '/sessions',
            icon: 'Clock',
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'Test',
        groupPath: '/test',
        icon: 'FileSpreadsheet',
        pages: [
          {
            title: 'Pivot',
            pagePath: '/pivot',
            icon: 'FileSpreadsheet',
            roles: ['admin'],
            hidden: true,
          },
          {
            title: 'Pivot (Static)',
            pagePath: '/pivot-static',
            icon: 'FileSpreadsheet',
            roles: ['admin'],
            hidden: true,
          },
        ],
      },
    ],
  },
];
