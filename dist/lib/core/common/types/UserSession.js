export const GUEST_USER_SESSION = Object.freeze({
  id: '',
  name: 'Guest',
  email: 'guest',
  userName: 'guest',
  userId: 0,
  roles: ['guest'],
  settings: {
    theme: 'light',
  },
  teams: [],
});
export const TEST_SESSION = Object.freeze({
  id: 'test',
  user: {
    name: 'Test User',
    email: 'test@venky.local',
    userName: 'test',
    roles: ['test'],
    settings: {
      theme: 'light',
    },
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
});
export const BACKGROUND_JOB_SESSION = Object.freeze({
  id: 'background-job',
  user: {
    name: 'Background Job',
    email: 'background-job@venky.local',
    userName: 'background-job',
    roles: ['background-job'],
    settings: {
      theme: 'light',
    },
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
});
//# sourceMappingURL=UserSession.js.map
