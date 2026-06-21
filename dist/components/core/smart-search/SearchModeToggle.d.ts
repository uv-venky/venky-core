export type SearchInputMode = 'chips' | 'nl';
interface SearchModeToggleProps {
    mode: SearchInputMode;
    onModeChange: (mode: SearchInputMode) => void;
    disabled?: boolean;
}
/**
 * Toggles SmartSearch between the chip filter builder and natural-language mode.
 * Only mounted when deployment config and per-page opt-in both enable NL search (see SmartSearch).
 */
export declare function SearchModeToggle({ mode, onModeChange, disabled }: SearchModeToggleProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SearchModeToggle.d.ts.map