import { useIsStoreLoading, useHasMoreRows } from '@/components/core/hooks/useStoreHooks';
import { Button } from '@/components/ui/button';
import type { Store } from '@/lib/core/common/types/Store';
import { ChevronDownIcon, Loader2 } from 'lucide-react';

export default function LoadMore<T extends object>({
  store,
  variant = 'default',
}: {
  store: Store<T>;
  variant?: 'default' | 'link' | 'ghost';
}) {
  const hasMoreRows = useHasMoreRows(store);
  const isLoading = useIsStoreLoading(store);

  if (!hasMoreRows) {
    return null;
  }

  return (
    <Button
      variant={variant}
      className="flex items-center justify-center gap-4"
      onClick={() => store.next()}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDownIcon className="h-4 w-4" />}
      Load more...
    </Button>
  );
}
