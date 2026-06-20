'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BarChart3, FileBarChart, Plus, Table, Table2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaAction?: () => void;
  showCta?: boolean;
  icon?: 'chart' | 'data' | 'pivot' | 'table';
  className?: string;
  style?: React.CSSProperties;
}

export default function EmptyState({
  title = 'No data available',
  description = "There's no data to display at the moment.",
  icon = 'data',
  className,
  ctaText,
  ctaAction,
  showCta,
  style,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex h-full w-full flex-col items-center justify-center bg-background/50', className)}
      style={style}
    >
      <div className="flex flex-col items-center justify-center p-6 text-center sm:p-10">
        <div className="mb-4 rounded-full border border-muted-foreground/25 border-dashed bg-muted/50 p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {icon === 'chart' ? (
              <BarChart3 className="h-12 w-12 text-muted-foreground/70" />
            ) : icon === 'pivot' ? (
              <Table2 className="h-12 w-12 text-muted-foreground/70" />
            ) : icon === 'table' ? (
              <Table className="h-12 w-12 text-muted-foreground/70" />
            ) : (
              <FileBarChart className="h-12 w-12 text-muted-foreground/70" />
            )}
          </motion.div>
        </div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <h3 className="mb-2 font-semibold text-xl tracking-tight">{title}</h3>
          <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
          {showCta && (
            <Button
              activityId={`empty-${title.toLowerCase().replace(/\s+/g, '-')}-cta`}
              onClick={ctaAction}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {ctaText}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
