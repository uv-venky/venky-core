/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import { Hash, Type } from 'lucide-react';

interface LookupTypeItemProps {
  lookupType: LookupTypes;
  isSelected: boolean;
  onClick: () => void;
}

export function LookupTypeItem({ lookupType, isSelected, onClick }: LookupTypeItemProps) {
  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent',
        isSelected && 'border-primary bg-accent',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{lookupType.code}</span>
            <Badge variant={lookupType.valueType === 'number' ? 'default' : 'secondary'} className="text-xs">
              {lookupType.valueType === 'number' ? (
                <Hash className="mr-1 h-3 w-3" />
              ) : (
                <Type className="mr-1 h-3 w-3" />
              )}
              {lookupType.valueType}
            </Badge>
          </div>
          <div className="mt-1 text-muted-foreground text-sm">{lookupType.name}</div>
          {lookupType.description && (
            <div className="mt-1 line-clamp-2 text-muted-foreground text-xs">{lookupType.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
