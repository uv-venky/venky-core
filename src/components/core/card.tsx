import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SimpleCard({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <Card className="flex-1 gap-0 overflow-hidden p-0 shadow-none">
      <CardHeader className="items-center gap-0 border-b px-2 py-4 font-semibold text-sm [.border-b]:py-4">
        {header}
      </CardHeader>
      <CardContent className="overflow-hidden p-0">{children}</CardContent>
    </Card>
  );
}
