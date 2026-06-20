/* Copyright (c) 2024-present Venky Corp. */

import { proxy, useSnapshot } from 'valtio';
import type { Store, StoreState, TreeStoreState } from '@/lib/core/common/types/Store';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type { UserAvatar } from '@/lib/common/ds/types/core/UserAvatar';
import { customAlphabet } from 'nanoid';

const trackIdSuffix = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 5);

const now = new Date();
const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
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

type GlobalState = {
  global: Record<string, any>;
  userAvatars: Record<string | number, UserAvatar | { isLoading: boolean }>;
  trackId: string;
};

const GUEST_USER_AVATAR: UserAvatar = {
  displayName: 'Guest',
  email: 'guest',
  startDate: new Date().toISOString(),
  userId: -1,
  userName: 'guest',
};

export const globalState = proxy<GlobalState>({
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

export function useUserAvatar(username: string | number = '$x$'): UserAvatar | { isLoading: boolean } {
  if (!globalState.userAvatars[username]) {
    globalState.userAvatars[username] = { isLoading: true };
  }
  return useSnapshot(globalState.userAvatars)[username];
}

export function putUserAvatar(userId: string | number, userAvatar: UserAvatar) {
  globalState.userAvatars[userId] = userAvatar;
}

export function useGlobalSnapshot<T>(key: string, initializeStateCallback: () => T) {
  if (!globalState.global[key]) {
    globalState.global[key] = initializeStateCallback();
  }
  return useSnapshot(globalState.global[key]) as T;
}

export function getOrCreateGlobalState<T>(key: string, initializeStateCallback: () => T) {
  if (!globalState.global[key]) {
    globalState.global[key] = initializeStateCallback();
  }
  return globalState.global[key] as T;
}

export function getGlobalState<T>(key: string) {
  return globalState.global[key] as T;
}

type State = {
  data: Record<string, StoreState<any>>;

  attributes: Record<string, Attribute<any>[]>;

  pkAttributes: Record<string, Attribute<any>[]>;
  treeState: Record<string, TreeStoreState>;
};

export const storeState = proxy<State>({
  data: {},
  attributes: {},
  pkAttributes: {},
  treeState: {},
});

export const hashState = proxy<{
  hash: {
    current: URLSearchParams;
    previous: URLSearchParams;
    pathname: string;
  };
}>({
  hash: {
    current: new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.slice(1) : ''),
    previous: new URLSearchParams(),
    pathname: typeof window !== 'undefined' ? window.location.pathname : '',
  },
});

export const STORE_CACHE = new Map<string, Store<any>>();
