'use client';

import { useClientSession } from '@/components/core/session-context';
import { LazyMonacoEditor } from '../MonacoEditorLazy';
import type { DataSource } from '../types';
import { useMemo } from 'react';

interface DataSourceTabProps {
  selectedDS: DataSource;
  filter?: Show;
}

export type Show = 'primary' | 'who' | 'required' | 'all';

export const WHO_ATTRIBUTES = [
  'createdBy',
  'createdAt',
  'updatedBy',
  'updatedAt',
  'lastUpdateDate',
  'creationDate',
  'lastUpdatedBy',
];

export function getWhoAttributesCount(ds?: DataSource): number {
  return ds?.attributes.filter((attr) => WHO_ATTRIBUTES.includes(attr.code)).length ?? 0;
}

export function isMissingPrimaryKey(ds?: DataSource): boolean {
  return ds?.attributes.filter((attr) => attr.primary).length === 0;
}

export function DataSourceTab({ selectedDS, filter }: DataSourceTabProps) {
  const session = useClientSession();

  const ds = useMemo(() => {
    if (!selectedDS) return null;
    if (!filter) return selectedDS;
    return {
      ...selectedDS,
      access: filter ? undefined : selectedDS.access,
      attributes: selectedDS.attributes.filter(
        (attr) =>
          (filter === 'primary' && attr.primary) ||
          (filter === 'who' && WHO_ATTRIBUTES.includes(attr.code)) ||
          (filter === 'required' && !attr.optional),
      ),
    };
  }, [selectedDS, filter]);

  const payload = filter ? ds?.attributes : { dataSource: ds, userRoles: session.roles };

  return (
    <div className="flex h-full flex-col">
      <LazyMonacoEditor
        value={selectedDS ? JSON.stringify(payload, null, 2) : 'Select a data source to view its definition'}
        type="Result"
        disabled
      />
    </div>
  );
}
