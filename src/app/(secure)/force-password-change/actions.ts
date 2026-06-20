'use server';

import { auth, hashPassword } from '@/auth';
import type { Session } from '@/auth';
import { transaction } from '@/lib/core/server/db';
import { compare } from 'bcrypt-ts';
import { getValidIpAddress, isUserActiveSync, type DBUserActive } from '@/lib/core/server/utils';
import { getRequestContext } from '@/lib/core/server/request-context';
import { logActivity } from '@/lib/core/server/activity';
import { signOutAllUserSessions } from '@/lib/core/server/password-reset';
import { validateNewPassword } from '@/lib/core/server/password-reset';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { PREFIX } from '@/lib/server/constants';
import type { ForcedPasswordChangeInput, Result } from './types';

interface User extends DBUserActive {
  user_name: string;
  display_name: string;
  password_hash: string;
  force_password_change: boolean;
}

export async function changePasswordForced(formData: FormData): Promise<Result> {
  const session = await auth(true);

  if (!session?.user?.userName) {
    return {
      status: 'ERROR',
      message: 'You must be logged in to change your password.',
    };
  }

  return changePasswordForForcedReset(session, {
    currentPassword: (formData.get('currentPassword') as string | null) ?? '',
    newPassword: (formData.get('newPassword') as string | null) ?? '',
    confirmPassword: (formData.get('confirmPassword') as string | null) ?? '',
  });
}

export async function changePasswordForForcedReset(
  session: Session,
  input: ForcedPasswordChangeInput,
): Promise<Result> {
  const { currentPassword, newPassword, confirmPassword } = input;

  if (isEmpty(currentPassword) || isEmpty(newPassword) || isEmpty(confirmPassword)) {
    return { status: 'ERROR', message: 'All fields are required.' };
  }

  if (newPassword !== confirmPassword) {
    return { status: 'ERROR', message: 'New passwords do not match.' };
  }
  return await transaction(async (client): Promise<Result> => {
    // Get user details
    const { rows } = await client.query<User & { previous_password_hashes: string[] }>(
      `SELECT
      user_name,
      email,
      display_name,
      start_date,
      end_date,
      locked,
      password_hash,
      force_password_change,
      previous_password_hashes
    FROM ${PREFIX}users WHERE user_name = $1`,
      [session.user.userName],
    );

    const user = rows[0];
    if (!user || !isUserActiveSync(user)) {
      return { status: 'ERROR', message: 'User account is not active!' };
    }

    // Check if user actually needs to change password
    if (!user.force_password_change) {
      return {
        status: 'ERROR',
        message: 'Password change is not required for your account.',
      };
    }

    // Verify current password
    if (user.password_hash === 'SSO') {
      return {
        status: 'ERROR',
        message: 'SSO users cannot change their password here.',
      };
    }

    const isCurrentPasswordValid = await compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return { status: 'ERROR', message: 'Current password is incorrect.' };
    }

    // Validate new password
    const headersList = await getRequestContext('force-password-change').getHeaders();
    const ipAddress = getValidIpAddress(headersList);

    let previousPasswordHashes = [];
    previousPasswordHashes = Array.isArray(user.previous_password_hashes) ? user.previous_password_hashes : [];
    previousPasswordHashes.push(user.password_hash);
    previousPasswordHashes = previousPasswordHashes.slice(-3);

    const error = await validateNewPassword(newPassword, previousPasswordHashes);
    if (error) {
      return { status: 'ERROR', message: error };
    }

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await client.query(
      `UPDATE ${PREFIX}users SET 
      password_hash = $1, 
      last_password_reset = now(), 
      last_password_reset_ip_address = $2, 
      last_password_reset_by = $3, 
      previous_password_hashes = $4::jsonb,
      updated_at = now(),
      updated_by = $5,
      force_password_change = false
    WHERE user_name = $6`,
      [passwordHash, ipAddress, user.user_name, JSON.stringify(previousPasswordHashes), user.user_name, user.user_name],
    );

    // Sign out all other sessions
    await signOutAllUserSessions(client, session.user.userName);

    // Log the activity
    await logActivity({
      userName: session.user.userName,
      eventType: 'Forced Password Change',
      eventId: session.user.userName,
      sessionId: session.id,
      createdAt: new Date().toISOString(),
      metadata: {
        ipAddress,
        userAgent: headersList.get('user-agent'),
      },
    });
    return { status: 'OK' };
  });
}
