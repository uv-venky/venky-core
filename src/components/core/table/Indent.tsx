import { cn } from '@/lib/utils';
import { memo, type FC, type ReactElement } from 'react';

interface IndentProps {
  level: number;
  isStart: boolean[];
  isEnd: boolean[];
}

const Indent: FC<IndentProps> = ({ level, isStart, isEnd }) => {
  if (level === 0) {
    return null;
  }
  const baseClassName = `tree-cell-indent`;
  const list: ReactElement[] = [];
  for (let i = 1; i <= level; i += 1) {
    list.push(
      <span
        key={i}
        className={cn(baseClassName, i === level && `${baseClassName}-edge`, {
          [`${baseClassName}-start`]: isStart[i],
          [`${baseClassName}-end`]: isEnd[i],
        })}
      />,
    );
  }

  return (
    <span aria-hidden="true" className={`tree-cell-indent-wrapper`}>
      {list}
    </span>
  );
};

export default memo(Indent);
