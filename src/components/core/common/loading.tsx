import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-8 w-[500px] rounded-lg" />
    </div>
  );
}

export function DonutSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-[180px] w-[180px]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="20"
              strokeOpacity="0.1"
            />

            {/* Blue segment ~25% */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--chart-1)"
              strokeWidth="20"
              strokeDasharray="63 187"
              strokeDashoffset="0"
              className="animate-pulse"
              strokeOpacity="0.3"
            />

            {/* Orange segment ~45% */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--chart-2)"
              strokeWidth="20"
              strokeDasharray="113 137"
              strokeDashoffset="-63"
              className="animate-pulse"
              strokeOpacity="0.3"
            />

            {/* Green segment ~30% */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--chart-3)"
              strokeWidth="20"
              strokeDasharray="75 175"
              strokeDashoffset="-176"
              className="animate-pulse"
              strokeOpacity="0.3"
            />

            {/* Inner circle for donut hole */}
            <circle cx="50" cy="50" r="30" fill="var(--background)" />
          </svg>
        </div>

        {/* Labels */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-1/30" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-2/30" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-chart-3/30" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricCardSkeleton({ className = 'flex-1' }: { className?: string }) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center rounded-lg border', className)}>
      <span className="text-muted-foreground">
        <Skeleton className="h-4 w-16" />
      </span>
      <span className="mt-2 font-extrabold text-3xl text-chart-1">
        <Skeleton className="h-6 w-28" />
      </span>
    </div>
  );
}
