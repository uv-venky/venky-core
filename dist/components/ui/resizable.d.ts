import type * as React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
declare function ResizablePanelGroup({ className, direction, ...props }: React.ComponentProps<typeof Group> & {
    direction?: 'horizontal' | 'vertical';
}): import("react/jsx-runtime").JSX.Element;
declare function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>): import("react/jsx-runtime").JSX.Element;
declare function ResizableHandle({ withHandle, className, ...props }: React.ComponentProps<typeof Separator> & {
    withHandle?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
//# sourceMappingURL=resizable.d.ts.map