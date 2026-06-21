export interface RichTextEditorFeatures {
    /** Enable H1, H2, H3 heading buttons */
    headings?: boolean;
    /** Enable text alignment (left, center, right) */
    alignment?: boolean;
    /** Enable highlight text button */
    highlight?: boolean;
    /** Enable code block support */
    codeBlock?: boolean;
    /** Enable blockquote support */
    blockquote?: boolean;
    /** Enable horizontal rule divider */
    horizontalRule?: boolean;
    /** Enable undo/redo buttons */
    undoRedo?: boolean;
    /** Enable strikethrough button */
    strikethrough?: boolean;
}
export interface RichTextEditorProps {
    /** Current HTML content value */
    value: string;
    /** Callback when content changes */
    onChange: (value: string) => void;
    /** Optional save callback - when provided, shows a Save button */
    onSave?: (content: string) => Promise<void>;
    /** Placeholder text when editor is empty */
    placeholder?: string;
    /** Additional CSS classes */
    className?: string;
    /** Feature flags for toolbar buttons */
    features?: RichTextEditorFeatures;
    /** Toolbar position: 'floating' shows on selection, 'fixed-top' always visible */
    toolbarPosition?: 'floating' | 'fixed-top';
    /** Whether the editor is editable */
    editable?: boolean;
    /** External saving state control */
    isSaving?: boolean;
    /** Custom styles for the editor content area */
    contentClassName?: string;
}
export declare function RichTextEditor({ value, onChange, onSave, placeholder, className, features, toolbarPosition, editable, isSaving, contentClassName, }: RichTextEditorProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=rich-text-editor.d.ts.map