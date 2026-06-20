import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface PivotTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function PivotTableSkeleton({ rows = 5, columns = 4 }: PivotTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Table skeleton */}
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Corner cell */}
              <TableHead>
                <Skeleton className="h-6 w-24" />
              </TableHead>

              {/* Column headers */}
              {Array.from({ length: columns }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: i is ok here
                <TableHead key={i} className="text-right">
                  <Skeleton className="ml-auto h-6 w-20" />
                </TableHead>
              ))}

              {/* Total column header */}
              <TableHead className="text-right">
                <Skeleton className="ml-auto h-6 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Data rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: rowIndex is ok here
              <TableRow key={rowIndex}>
                {/* Row header */}
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>

                {/* Data cells */}
                {Array.from({ length: columns }).map((_, colIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: colIndex is ok here
                  <TableCell key={colIndex} className="text-right">
                    <Skeleton className="ml-auto h-5 w-16" />
                  </TableCell>
                ))}

                {/* Row total */}
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
              </TableRow>
            ))}

            {/* Totals row */}
            <TableRow className="bg-muted/50">
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>

              {/* Column totals */}
              {Array.from({ length: columns }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: i is ok here
                <TableCell key={i} className="text-right">
                  <Skeleton className="ml-auto h-6 w-20" />
                </TableCell>
              ))}

              {/* Grand total */}
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-6 w-24" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
