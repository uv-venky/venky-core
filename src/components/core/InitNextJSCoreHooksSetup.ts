'use client';

/**
 * Wire up core's pluggable navigation hooks and Link with Next.js equivalents.
 * Call useCoreNavigationSetup() once in the root client layout.
 */
import { setRouterImplementation, type AppRouter } from '@/components/core/hooks/useRouter';
import { setPathnameImplementation } from '@/components/core/hooks/usePathname';
import { setSearchParamsImplementation } from '@/components/core/hooks/useSearchParams';
import { setParamsImplementation } from '@/components/core/hooks/useParams';
import { setLinkComponent, type AppLinkProps } from '@/components/core/link';
import NextLink from 'next/link';
import { createElement } from 'react';
import {
  usePathname as useNextPathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
  useRouter as useNextRouter,
} from 'next/navigation';

function useNextSearchParamsImplementation() {
  return useNextSearchParams() ?? new URLSearchParams();
}

setPathnameImplementation(useNextPathname);
setSearchParamsImplementation(useNextSearchParamsImplementation);
setParamsImplementation(useNextParams);

function NextLinkAdapter(props: AppLinkProps) {
  const { href, prefetch, children, ...rest } = props;
  return createElement(NextLink, { href, prefetch, ...rest }, children);
}
setLinkComponent(NextLinkAdapter);

function useCoreNavigationSetup(): void {
  const nextRouter = useNextRouter();

  // Router must be set every render since nextRouter reference may change
  const router: AppRouter = {
    push(url: string) {
      nextRouter.push(url);
    },
    replace(url: string) {
      nextRouter.replace(url);
    },
  };
  setRouterImplementation(router);
}

export function InitNextJSCoreHooksSetup(): React.ReactNode {
  useCoreNavigationSetup();
  return null;
}
