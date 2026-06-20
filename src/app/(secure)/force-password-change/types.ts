/* Copyright (c) 2024-present Venky Corp. */

export type Result = { status: 'OK' } | { status: 'ERROR'; message: string };

export interface ForcedPasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
