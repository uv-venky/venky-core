export interface PopupProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    description?: string;
    contentClassName?: string;
    headerToolbar?: React.ReactNode;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    resizable?: boolean;
    disableClose?: boolean;
    bodyClassName?: string;
    modal?: boolean;
}
export declare const Popup: (props: PopupProps) => React.ReactNode;
//# sourceMappingURL=popup.d.ts.map