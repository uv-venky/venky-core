import type { Team } from '@/components/sidebar/types';
import type { UserSettings } from './UserSettings';
import type { Session } from './Auth';

// biome-ignore lint/suspicious/noEmptyInterface: empty interface is intentional
export interface SessionMetadata {}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  image?: string;
  userName: string;
  userId?: number;
  roles: string[];
  settings: UserSettings;
  teams: Team[];
  metadata?: SessionMetadata;
}

export const GUEST_USER_SESSION: Readonly<UserSession> = Object.freeze({
  id: '',
  name: 'Guest',
  email: 'guest',
  userName: 'guest',
  userId: 0,
  roles: ['guest'],
  settings: {
    theme: 'light' as const,
  },
  teams: [],
});

export const TEST_SESSION: Readonly<Session> = Object.freeze({
  id: 'test',
  user: {
    name: 'Test User',
    email: 'test@venky.local',
    userName: 'test',
    roles: ['test'],
    settings: {
      theme: 'light' as const,
    },
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
});

export const BACKGROUND_JOB_SESSION: Readonly<Session> = Object.freeze({
  id: 'background-job',
  user: {
    name: 'Background Job',
    email: 'background-job@venky.local',
    userName: 'background-job',
    roles: ['background-job'],
    settings: {
      theme: 'light' as const,
    },
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
});
