import type { Session } from '../../../auth';
import type { ForcedPasswordChangeInput, Result } from './types';
export declare function changePasswordForced(formData: FormData): Promise<Result>;
export declare function changePasswordForForcedReset(
  session: Session,
  input: ForcedPasswordChangeInput,
): Promise<Result>;
//# sourceMappingURL=actions.d.ts.map
