export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    content: string;
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    /** Single-button mode: style the confirm action as destructive (e.g. delete). */
    confirmButtonVariant?: 'default' | 'destructive';
    confirmationText?: string;
    onOk: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onClose: () => void;
    action1Label?: string;
    action2Label?: string;
    onAction1?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onAction2?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export declare const userConfirmationState: {
    props: ConfirmDialogProps;
};
export declare function confirmWithUser(args: {
    title: string;
    content: string;
    action1Label: string;
    action2Label: string;
    cancelButtonLabel?: string;
}): Promise<string | null>;
export declare function confirmWithUser(args: {
    title: string;
    content: string;
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    confirmButtonVariant?: 'default' | 'destructive';
    confirmationText?: string;
}): Promise<boolean>;
//# sourceMappingURL=UserConfirmationState.d.ts.map