import { cn } from '@/lib/utils';

const DEFAULT_FILL = '#512eff';

export interface LoginLogoMarkProps {
  className?: string;
  fill?: string;
}

/** Shared stylized V mark used by VenkyLogo and MiniLogo. */
export function VenkyLogoMark({ className, fill = DEFAULT_FILL }: LoginLogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="venky-v-gradient" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor={fill} />
        </linearGradient>
      </defs>
      <path d="M8 6 L24 42 L40 6 L34 6 L24 30 L14 6 Z" fill="url(#venky-v-gradient)" />
    </svg>
  );
}
