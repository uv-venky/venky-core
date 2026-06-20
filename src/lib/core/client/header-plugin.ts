/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/core/common/constants';

export type HeaderModifier = (headers: Record<string, string>) => void;

declare global {
  var _$venkyHeaderModifiers: HeaderModifier[] | undefined;
}

function getHeaderModifiers(): HeaderModifier[] {
  if (!globalThis._$venkyHeaderModifiers) {
    globalThis._$venkyHeaderModifiers = [];
  }
  return globalThis._$venkyHeaderModifiers;
}

export function registerHeaderModifier(modifier: HeaderModifier): () => void {
  const modifiers = getHeaderModifiers();
  modifiers.push(modifier);
  return () => {
    const index = modifiers.indexOf(modifier);
    if (index > -1) {
      modifiers.splice(index, 1);
    }
  };
}

export function applyHeaderModifiers(headers: Record<string, string>): void {
  // Always attach the CSRF token from the venky-csrf cookie (double-submit
  // pattern). Done here so every fetch via applyHeaderModifiers participates
  // without each callsite needing to know.
  const csrf = readCsrfCookie();
  if (csrf) {
    headers[CSRF_HEADER_NAME] = csrf;
  }

  const modifiers = getHeaderModifiers();
  modifiers.forEach((modifier) => {
    modifier(headers);
  });
}

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const c of cookies) {
    if (c.startsWith(`${CSRF_COOKIE_NAME}=`)) {
      return decodeURIComponent(c.slice(`${CSRF_COOKIE_NAME}=`.length));
    }
  }
  return null;
}

export function clearHeaderModifiers(): void {
  if (globalThis._$venkyHeaderModifiers) {
    globalThis._$venkyHeaderModifiers = [];
  }
}
