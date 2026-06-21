import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2024-present VENKY Corp. */
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { ChevronRightIcon } from 'lucide-react';
import { memo } from 'react';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
function ExpandCollapseIcon(props) {
  useWhyDidYouUpdate('ExpandCollapseIcon', props);
  const { dataTestId, isExpanded, onClick } = props;
  return _jsx(Button, {
    'data-testid': dataTestId,
    variant: 'ghost',
    size: 'icon',
    'data-tip': isExpanded ? 'Collapse' : 'Expand',
    className: cn('ml-2 size-8 cursor-pointer p-0', isExpanded && '[&>svg]:rotate-90'),
    onClick: (e) => {
      e.stopPropagation();
      onClick(!isExpanded);
    },
    children: _jsx(ChevronRightIcon, {
      className:
        'pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200',
    }),
  });
}
export default memo(ExpandCollapseIcon);
//# sourceMappingURL=ExpandCollapseIcon.js.map
