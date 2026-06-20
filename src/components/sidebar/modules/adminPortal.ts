import type { ServerTeam } from '@/components/sidebar/types';
import { adminModules } from './admin';

export const adminPortal: ServerTeam = {
  name: 'Administration',
  logo: 'MiniLogo',
  teamPath: '/admin',
  modules: adminModules,
  oneLevelNav: [],
};
