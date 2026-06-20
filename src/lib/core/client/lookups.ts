/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import type { LookupValues } from '@/lib/common/ds/types/core/LookupValues';
import stringify from 'fast-json-stable-stringify';
import { applyHeaderModifiers } from '@/lib/core/client/header-plugin';
import { isErrorResponse } from '@/lib/core/common/error';
import { showError } from '@/lib/core/client/notifications';
import { getTrackId } from '@/lib/core/client/state';
import type { Query } from '@/lib/core/common/ds/types/filter';

export type LookupValueOption = {
  value: string | number;
  label: string;
  description?: string | null;
  metadata?: any;
};

const lookupCache = new Map<string, { data: LookupValueOption[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

async function fetchDataSourceData<T extends object>(datasourceId: string, query: Query<T>): Promise<T[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    headers['X-Track-Id'] = getTrackId();
    applyHeaderModifiers(headers);
    const response = await fetch(`/api/ds`, {
      credentials: 'include',
      method: 'POST',
      headers,
      body: stringify({
        ds: datasourceId,
        query,
      }),
    });
    if (!response) {
      showError('Failed to fetch data: response is undefined');
      return [];
    }
    if (!response.ok) {
      showError(`Failed to fetch data: response is not ok: ${response.status} ${response.statusText}`);
      return [];
    }
    const resp = await response.json();
    if (isErrorResponse(resp)) {
      showError(resp.message ?? 'Unknown error');
      return [];
    }
    const { rows } = resp;
    return rows ?? [];
  } catch (e) {
    showError(`Failed to fetch data: ${e instanceof Error ? e.message : 'Unknown error'}`);
    return [];
  }
}

async function fetchLookupValuesByTypeCode(lookupTypeCode: string): Promise<LookupValueOption[]> {
  const cached = lookupCache.get(lookupTypeCode);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  const lookupTypes = await fetchDataSourceData<LookupTypes>('LookupTypes', {
    data: { code: lookupTypeCode },
    limit: 1,
  });

  if (lookupTypes.length === 0) {
    lookupCache.set(lookupTypeCode, { data: [], timestamp: Date.now() });
    return [];
  }

  const lookupType = lookupTypes[0];
  const valueType = lookupType.valueType;

  // Fetch active lookup values
  const lookupValues = await fetchDataSourceData<LookupValues>('LookupValues', {
    data: { lookupTypeId: lookupType.id, isActive: true },
    sort: { displayOrder: 1, label: 2 },
    limit: 2000,
    select: ['value', 'label', 'description', 'metadata'],
  });

  const options: LookupValueOption[] = lookupValues.map((lv) => {
    let parsedValue: string | number = lv.value;
    if (valueType === 'number') {
      const numValue = Number(lv.value);
      if (!Number.isNaN(numValue)) {
        parsedValue = numValue;
      }
    }

    return {
      value: parsedValue,
      label: lv.label,
      description: lv.description,
      metadata: lv.metadata,
    };
  });

  lookupCache.set(lookupTypeCode, { data: options, timestamp: Date.now() });
  return options;
}

export async function getLookupsByType(lookupTypeCode: string): Promise<LookupValueOption[]> {
  return fetchLookupValuesByTypeCode(lookupTypeCode);
}

export async function getLookupValue(
  lookupTypeCode: string,
  value: string | number,
): Promise<LookupValueOption | undefined> {
  const lookups = await getLookupsByType(lookupTypeCode);
  return lookups.find((lv) => lv.value === value);
}

export async function getLookupTypes(): Promise<LookupTypes[]> {
  return fetchDataSourceData<LookupTypes>('LookupTypes', {
    sort: { code: 1 },
    limit: 1000,
  });
}

export function clearLookupCache(lookupTypeCode?: string): void {
  if (lookupTypeCode) {
    lookupCache.delete(lookupTypeCode);
  } else {
    lookupCache.clear();
  }
}
