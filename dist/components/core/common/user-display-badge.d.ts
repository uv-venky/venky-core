import type { badgeVariants } from '../../../components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
interface UserDisplayBadgeProps {
    username: string;
    onClick?: React.MouseEventHandler<HTMLSpanElement>;
    className?: string;
    variant?: VariantProps<typeof badgeVariants>['variant'];
}
export default function UserDisplayBadge({ username, onClick, className, variant, }: UserDisplayBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=user-display-badge.d.ts.map