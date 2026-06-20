import { Code2, Play, Sparkles, Zap } from 'lucide-react';

interface EmptyStateProps {
  actionLabel?: string;
}

export default function EmptyState({ actionLabel = 'Execute' }: EmptyStateProps) {
  return (
    <div className="relative flex h-full min-h-[300px] w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-l from-cyan-500/20 to-transparent blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated icon container */}
        <div className="group relative mb-8">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 h-28 w-28 animate-ping rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 opacity-20" />

          {/* Rotating border gradient */}
          <div className="absolute -inset-1 animate-[spin_4s_linear_infinite] rounded-2xl bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500 opacity-50 blur-sm" />

          {/* Main icon container */}
          <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-2xl shadow-violet-500/30">
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />

            {/* Icon */}
            <div className="relative flex items-center justify-center">
              <Code2 className="h-10 w-10 text-white" strokeWidth={1.5} />
              <Play className="absolute h-5 w-5 translate-x-0.5 text-white/90" fill="currentColor" strokeWidth={0} />
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute -top-3 -right-3 flex h-8 w-8 animate-bounce items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg delay-100">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 flex h-6 w-6 animate-bounce items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg delay-300">
            <Zap className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="font-semibold text-foreground text-lg">Ready to {actionLabel}</h3>
          <p className="max-w-xs text-muted-foreground text-sm">
            Write your query and click{' '}
            <span className="font-medium text-violet-600 dark:text-violet-400">{actionLabel}</span> to see the response
          </p>
        </div>
      </div>
    </div>
  );
}
