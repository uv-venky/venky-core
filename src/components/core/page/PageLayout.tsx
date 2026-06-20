/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Suspense, type ReactNode } from 'react';
import Suspended from '@/components/core/common/Suspended';
import { cn } from '@/lib/utils';
import { PageHeaderActions } from './page-header-actions';
import { Separator } from '@/components/ui/separator';

export default function PageLayout({
  icon,
  leftSection,
  mainSection,
  filterSection,
  subTitle,
  title,
  toolbar,
  children,
  transparentMainSection = false,
  enableShareUrl = false,
  showThemeToggle = false,
  showUserProfile = false,
  enableComments = false,
  statsSection,
}: {
  icon?: ReactNode;
  leftSection?: ReactNode;
  mainSection?: ReactNode;
  filterSection?: ReactNode;
  subTitle?: ReactNode;
  title: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
  transparentMainSection?: boolean;
  enableShareUrl?: boolean;
  enableComments?: boolean;
  showThemeToggle?: boolean;
  showUserProfile?: boolean;
  statsSection?: ReactNode;
}) {
  if (mainSection && children) {
    throw new Error('mainSection and children cannot both be provided');
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden bg-accent p-4">
      <div className="flex h-12 w-full shrink-0 items-center gap-2">
        {icon && <div className="flex items-center">{icon}</div>}
        <div className="flex flex-1 select-none flex-col pl-2">
          {typeof title === 'string' ? (
            <div className="font-title-light text-xl" data-testid="page-title">
              {title}
            </div>
          ) : (
            <div className="min-w-0" data-testid="page-title">
              {title}
            </div>
          )}
          <div className="font-light text-sm" data-testid="page-subtitle">
            {subTitle}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toolbar && (
            <>
              <Suspense fallback={<Suspended name="Toolbar" />}>{toolbar}</Suspense>
              <Separator orientation="vertical" className="ml-2 data-[orientation=vertical]:h-8" />
            </>
          )}
          <PageHeaderActions
            enableShareUrl={enableShareUrl}
            enableComments={enableComments}
            showThemeToggle={showThemeToggle}
            showUserProfile={showUserProfile}
          />
        </div>
      </div>
      {statsSection && (
        <div className="shrink-0">
          <Suspense fallback={<Suspended name="statsSection" />}>{statsSection}</Suspense>
        </div>
      )}
      {filterSection && (
        <div className="flex min-h-14 shrink-0 items-center rounded-lg border bg-background py-1">
          <Suspense fallback={<Suspended name="filterSection" />}>{filterSection}</Suspense>
        </div>
      )}
      {!leftSection ? (
        <div
          className={cn(
            'main relative flex flex-1 overflow-hidden',
            transparentMainSection ? 'bg-transparent' : 'rounded-lg border bg-background',
          )}
        >
          {<Suspense fallback={<Suspended name="mainSection1" />}>{mainSection ?? children}</Suspense>}
        </div>
      ) : (
        <div className="main2 flex flex-1 gap-4 overflow-hidden">
          <div className="flex max-h-full shrink-0 flex-col gap-4 overflow-auto">
            {<Suspense fallback={<Suspended name="leftSection" />}>{leftSection}</Suspense>}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-lg border bg-background">
            {<Suspense fallback={<Suspended name="mainSection2" />}>{mainSection ?? children}</Suspense>}
          </div>
        </div>
      )}
    </div>
  );
}
