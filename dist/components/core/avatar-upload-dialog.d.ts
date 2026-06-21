interface AvatarUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (dataUrl: string) => Promise<void> | void;
    initialImage?: string | null;
}
export default function AvatarUploadDialog({ open, onOpenChange, onSave, initialImage }: AvatarUploadDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=avatar-upload-dialog.d.ts.map