import type { Apps } from '../../../../../../lib/common/ds/types/core/Apps';
import type { Store } from '../../../../../../lib/core/common/types/Store';
interface AppEditDialogProps {
  app: Apps;
  store: Store<Apps>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
/**
 * Generates a secure random token using the crypto API
 * @returns A 64-character hexadecimal token
 */
export declare function generateSecureToken(): string;
export declare function AppEditDialog({
  app,
  store,
  open,
  onOpenChange,
}: AppEditDialogProps): import('react/jsx-runtime').JSX.Element | null;
export {};
//# sourceMappingURL=AppEditDialog.d.ts.map
