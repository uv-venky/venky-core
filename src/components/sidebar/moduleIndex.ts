import { adminPortal } from './modules/adminPortal';
import type { ServerTeam } from './types';
import { workflowPortal } from './modules/workflowPortal';

export const teams: ServerTeam[] = [adminPortal, workflowPortal];
