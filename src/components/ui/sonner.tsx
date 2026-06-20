'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className={cn('toaster group z-50', className)}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
          content: 'wv-content',
          default: 'wv-default',
          loading: 'wv-loading',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
