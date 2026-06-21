/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useContext } from 'react';
import { AppContext } from '../../../components/sidebar/app-provider-base';
/**
 * Resolves the effective table variant:
 * 1. Returns localVariant if provided (per-component override)
 * 2. Falls back to global tableVariant from AppProvider
 * 3. Falls back to 'default'
 */
export function useTableVariant(localVariant) {
  const ctx = useContext(AppContext);
  return localVariant ?? ctx?.tableVariant ?? 'default';
}
//# sourceMappingURL=useTableVariant.js.map
