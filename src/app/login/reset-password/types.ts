'use server';

import type { DBUserActive } from '@/lib/core/server/utils';

export type Result = { status: 'OK' } | { status: 'ERROR'; message: string };

export interface User extends DBUserActive {
  user_name: string;
  email: string;
  display_name: string;
  password_hash: string;
}

export interface PasswordResetRequestInput {
  username: string;
  email: string;
}

export interface ChangePasswordWithResetTokenInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export type { ValidPasswordResetTokenType } from '@/lib/core/common/types/PasswordReset';
