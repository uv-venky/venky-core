interface EmptyStateProps {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaAction?: () => void;
    showCta?: boolean;
    icon?: 'chart' | 'data' | 'pivot' | 'table';
    className?: string;
    style?: React.CSSProperties;
}
export default function EmptyState({ title, description, icon, className, ctaText, ctaAction, showCta, style, }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EmptyState.d.ts.map