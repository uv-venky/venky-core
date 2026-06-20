'use client';

import { useQuery } from '@/lib/core/client/useQuery';
import ErrorCard from '@/components/core/common/error';
import LoadingSkeleton from '@/components/core/common/loading';
import type { ActionName, ActionOutput, ActionParams } from '@/lib/server/actions';

export default function WithActionData<T extends ActionName>({
  action,
  children,
  params = [] as unknown as ActionParams<T>,
  fallback,
  errorCard,
}: {
  action: T;
  children: (data: Awaited<ActionOutput<T>>) => React.ReactNode;
  params?: ActionParams<T>;
  fallback?: React.ReactNode;
  errorCard?: (error: string) => React.ReactNode;
}): React.ReactNode {
  const result = useQuery(action, ...params);

  if (result.status === 'error') {
    return errorCard ? errorCard(result.error) : <ErrorCard>{result.error}</ErrorCard>;
  }

  if (result.status === 'loading') {
    return fallback ?? <LoadingSkeleton />;
  }

  return children(result.data);
}
