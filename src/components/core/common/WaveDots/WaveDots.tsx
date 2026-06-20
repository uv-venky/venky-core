import { cn } from '@/lib/utils';
import './wavedots.css';

interface Props {
  active?: boolean;
  white?: boolean;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  reason?: string;
}

export function WaveDots(props: Props) {
  return (
    <span
      className={cn('wave', props.className, {
        active: props.active,
        white: props.white,
        fill: props.fill,
      })}
      style={props.style}
    >
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="reason">{props.reason}</span>
    </span>
  );
}
