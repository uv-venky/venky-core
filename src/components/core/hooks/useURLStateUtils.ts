'use client';

import clientLogger from '@/lib/core/client/client-logger';

export type Serializer<T> = (val: T) => string;
export type Deserializer<T> = (val: string | null) => T | null;
export type Validator<T> = (val: T) => boolean;

export function defaultDeserialize<T>(v: string | null): T | null {
  if (v == null || v === '') return null;
  try {
    return JSON.parse(v);
  } catch {
    clientLogger.error({
      message: `Failed to parse JSON: ${v}`,
    });
    return null;
  }
}

export function defaultSerialize<T>(v: T): string {
  if (v == null) return '';
  return JSON.stringify(v);
}

export function defaultValidator(): boolean {
  return true;
}

export function jsonSerialize<T>(v: T): string {
  const s = JSON.stringify(v);
  return btoa(s);
}

export function jsonDeserialize<T>(v: string | null): T | null {
  if (v == null || v === '') return null;
  try {
    const s = atob(v);
    return JSON.parse(s);
  } catch {
    clientLogger.error({
      message: `Failed to parse JSON: ${v}`,
    });
    return null;
  }
}

export function base64Serialize(v: string): string {
  return btoa(v);
}

export function base64Deserialize(v: string | null): string | null {
  if (v == null || v === '') return null;
  try {
    return atob(v);
  } catch {
    console.error(`Failed to parse base64: ${v}`);
    return null;
  }
}

export function stringSerialize<T extends string>(v: T): string {
  return v;
}

export function stringDeserialize<T extends string>(v: string | null): T | null {
  if (v == null || v === '') return null;
  return v as T;
}

export function intSerialize(v: number): string {
  return v.toFixed();
}

export function intDeserialize(v: string | null): number | null {
  if (v == null || v === '') return null;
  return Number.parseInt(v, 10);
}
