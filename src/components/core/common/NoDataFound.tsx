'use client';
/* Copyright (c) 2023-present Venky Corp */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export default function NoDataFound(props: { action?: ReactNode; onAction?: () => void; icon?: ReactNode }) {
  return (
    <div className="relative block h-full w-full p-4">
      <button
        type="button"
        className={cn(
          'relative flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-divider border-dashed bg-default p-12 text-center focus:outline-none',
          {
            'hover:border-divider focus:ring-2 focus:ring-offset-2': props.onAction,
          },
          { 'cursor-default': !props.onAction },
        )}
        onClick={() => props.onAction?.()}
      >
        {!props.icon ? (
          <svg
            className="mx-auto h-12 w-12 text-secondary"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
            />
          </svg>
        ) : (
          props.icon
        )}
        <span className="mt-2 block font-semibold text-muted-foreground text-sm">
          {props.action || 'No data found!'}
        </span>
        {props.onAction && !props.action && (
          <span className="mt-2 block text-muted-foreground text-sm">Click to add data</span>
        )}
      </button>
    </div>
  );
}
