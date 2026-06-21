export interface ChipsInputProps {
    /** Field label rendered above the input. Pass empty string to omit. */
    label?: string;
    /** Current values. Order is preserved. */
    values: string[];
    /** Placeholder shown only while the value list is empty. */
    placeholder?: string;
    /** Callback fired with the new array on add/remove. */
    onChange: (next: string[]) => void;
    /** Disable input + remove buttons. */
    disabled?: boolean;
    /** Optional className applied to the outer wrapper. */
    className?: string;
    /** When false (default), duplicate values are silently dropped. */
    allowDuplicates?: boolean;
    /** Minimum width of the inline input in rem. Default 8. */
    inputMinWidthRem?: number;
}
/**
 * Free-form string[] editor: a list of removable chips plus an inline input.
 * Add via Enter or Tab, remove via the X button or Backspace on empty input,
 * commit pending text on blur. Use this in place of a comma-split string when
 * values themselves can contain commas (e.g. "Amazon (FC, excl. FLSD)").
 *
 * The outer wrapper mirrors the shadcn `Input` field shell (border, focus
 * ring) and the remove-chip button uses shadcn `Button` (ghost / icon-xs),
 * so this component looks and behaves like the rest of the form primitives.
 */
export declare function ChipsInput({ label, values, placeholder, onChange, disabled, className, allowDuplicates, inputMinWidthRem, }: ChipsInputProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=chips-input.d.ts.map