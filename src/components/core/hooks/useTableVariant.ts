/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useContext } from 'react';
import { AppContext } from '@/components/sidebar/app-provider-base';
import type { TableVariant } from '@/components/core/common/types';

/**
 * Resolves the effective table variant:
 * 1. Returns localVariant if provided (per-component override)
 * 2. Falls back to global tableVariant from AppProvider
 * 3. Falls back to 'default'
 */
export function useTableVariant(localVariant?: TableVariant): TableVariant {
  const ctx = useContext(AppContext);
  return localVariant ?? ctx?.tableVariant ?? 'default';
}
