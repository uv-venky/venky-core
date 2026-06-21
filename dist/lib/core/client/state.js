/* Copyright (c) 2024-present Venky Corp. */
import { proxy, useSnapshot } from 'valtio';
import { customAlphabet } from 'nanoid';
const trackIdSuffix = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 5);
const now = new Date();
const pad = (num, size = 2) => num.toString().padStart(size, '0');
const curr_time_str =
  pad(now.getFullYear() % 100) +
  pad(now.getMonth() + 1) +
  pad(now.getDate()) +
  pad(now.getHours()) +
  pad(now.getMinutes()) +
  pad(now.getSeconds());
const trackId = () => {
  return `UI.${curr_time_str}.${trackIdSuffix()}`;
};
const GUEST_USER_AVATAR = {
  displayName: 'Guest',
  email: 'guest',
  startDate: new Date().toISOString(),
  userId: -1,
  userName: 'guest',
};
export const globalState = proxy({
  global: {},
  userAvatars: { $x$: GUEST_USER_AVATAR },
  trackId: trackId(),
});
export function getTrackId() {
  return globalState.trackId;
}
export function resetTrackId() {
  globalState.trackId = trackId();
}
export function useUserAvatar(username = '$x$') {
  if (!globalState.userAvatars[username]) {
    globalState.userAvatars[username] = { isLoading: true };
  }
  return useSnapshot(globalState.userAvatars)[username];
}
export function putUserAvatar(userId, userAvatar) {
  globalState.userAvatars[userId] = userAvatar;
}
export function useGlobalSnapshot(key, initializeStateCallback) {
  if (!globalState.global[key]) {
    globalState.global[key] = initializeStateCallback();
  }
  return useSnapshot(globalState.global[key]);
}
export function getOrCreateGlobalState(key, initializeStateCallback) {
  if (!globalState.global[key]) {
    globalState.global[key] = initializeStateCallback();
  }
  return globalState.global[key];
}
export function getGlobalState(key) {
  return globalState.global[key];
}
export const storeState = proxy({
  data: {},
  attributes: {},
  pkAttributes: {},
  treeState: {},
});
export const hashState = proxy({
  hash: {
    current: new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.slice(1) : ''),
    previous: new URLSearchParams(),
    pathname: typeof window !== 'undefined' ? window.location.pathname : '',
  },
});
export const STORE_CACHE = new Map();
//# sourceMappingURL=state.js.map
