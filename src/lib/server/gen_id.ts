'use server';

import { customAlphabet } from 'nanoid';

const trackId = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 10);

export async function genTrackId() {
  return trackId();
}
