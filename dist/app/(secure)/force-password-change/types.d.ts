export type Result =
  | {
      status: 'OK';
    }
  | {
      status: 'ERROR';
      message: string;
    };
export interface ForcedPasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
//# sourceMappingURL=types.d.ts.map
