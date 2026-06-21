/* Copyright (c) 2024-present Venky Corp. */
import {
  DefaultAttribute,
  DefaultCalculatedAttribute,
  DefaultDataSource,
  DefaultFullAccess,
} from '../../../../../lib/server/ds/defs/defaults';
import { getPrefix } from '../../../../../lib/server/constants';
const PREFIX = getPrefix();
import { hashPassword } from '../../../../../auth';
import { sendNewUserEmail } from '../../../../../lib/core/server/email';
import { UserError } from '../../../../../lib/core/common/error';
import { signOutAllUserSessions } from '../../../../../lib/core/server/password-reset';
import { isPast, parseISO } from 'date-fns';
function generateStrongPassword(length = 12, useSymbols = true, useNumbers = true, useUppercase = true) {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let characterPool = lowercaseChars;
  if (useUppercase) characterPool += uppercaseChars;
  if (useNumbers) characterPool += numberChars;
  if (useSymbols) characterPool += symbolChars;
  if (!characterPool) {
    throw new Error('At least one character type must be enabled.');
  }
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterPool.length);
    password += characterPool[randomIndex];
  }
  return password;
}
export const UsersDS = {
  ...DefaultDataSource,
  id: 'Users',
  tableName: `${PREFIX}users`,
  attributes: [
    {
      ...DefaultAttribute,
      code: 'apiKey',
      name: 'Api Key',
      type: 'Text',
      column: 'api_key',
      maxLength: 256,
      select: false,
      query: false,
      update: false,
    },
    {
      ...DefaultAttribute,
      code: 'apiSecret',
      name: 'Api Secret',
      type: 'Text',
      column: 'api_secret',
      maxLength: 256,
      select: false,
      query: false,
      update: false,
    },
    {
      ...DefaultAttribute,
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      column: 'created_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'createdBy',
      name: 'Created By',
      type: 'Text',
      column: 'created_by',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'displayName',
      name: 'Display Name',
      type: 'Text',
      column: 'display_name',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'email',
      name: 'Email',
      type: 'Text',
      column: 'email',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'endDate',
      name: 'End Date',
      type: 'Date',
      column: 'end_date',
    },
    {
      ...DefaultAttribute,
      code: 'failedLoginAttempts',
      name: 'Failed Login Attempts',
      type: 'Number',
      column: 'failed_login_attempts',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'ipAddress',
      name: 'Ip Address',
      type: 'Text',
      column: 'ip_address',
      maxLength: 128,
    },
    {
      ...DefaultAttribute,
      code: 'lastFailedLogin',
      name: 'Last Failed Login',
      type: 'Date',
      column: 'last_failed_login',
    },
    {
      ...DefaultAttribute,
      code: 'lastFailedLoginIpAddress',
      name: 'Last Failed Login Ip Address',
      type: 'Text',
      column: 'last_failed_login_ip_address',
      maxLength: 128,
    },
    {
      ...DefaultAttribute,
      code: 'lastLogin',
      name: 'Last Login',
      type: 'Date',
      column: 'last_login',
    },
    {
      ...DefaultAttribute,
      code: 'lastPasswordReset',
      name: 'Last Password Reset',
      type: 'Date',
      column: 'last_password_reset',
    },
    {
      ...DefaultAttribute,
      code: 'lastPasswordResetBy',
      name: 'Last Password Reset By',
      type: 'Text',
      column: 'last_password_reset_by',
      maxLength: 128,
    },
    {
      ...DefaultAttribute,
      code: 'lastPasswordResetIpAddress',
      name: 'Last Password Reset Ip Address',
      type: 'Text',
      column: 'last_password_reset_ip_address',
      maxLength: 128,
    },
    {
      ...DefaultAttribute,
      code: 'locationName',
      name: 'Location Name',
      type: 'Text',
      column: 'location_name',
      maxLength: 128,
    },
    {
      ...DefaultAttribute,
      code: 'locked',
      name: 'Locked',
      type: 'Boolean',
      column: 'locked',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'passwordHash',
      name: 'Password Hash',
      type: 'Text',
      column: 'password_hash',
      maxLength: 256,
      optional: true,
      select: false,
      query: false,
      update: false,
    },
    {
      ...DefaultAttribute,
      code: 'picture',
      name: 'Picture',
      type: 'Text',
      column: 'picture',
      select: false,
      query: false,
      update: false,
    },
    {
      ...DefaultAttribute,
      code: 'previousPasswordHashes',
      name: 'Previous Password Hashes',
      type: 'JSON',
      column: 'previous_password_hashes',
      optional: false,
      select: false,
      query: false,
      update: false,
    },
    {
      ...DefaultAttribute,
      code: 'settings',
      name: 'Settings',
      type: 'JSON',
      column: 'settings',
      optional: false,
      select: true,
      query: false,
      update: false,
    },
    {
      ...DefaultAttribute,
      code: 'startDate',
      name: 'Start Date',
      type: 'Date',
      column: 'start_date',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'updatedAt',
      name: 'Updated At',
      type: 'Date',
      column: 'updated_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'updatedBy',
      name: 'Updated By',
      type: 'Text',
      column: 'updated_by',
      maxLength: 128,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'userId',
      name: 'User Id',
      type: 'Number',
      column: 'user_id',
    },
    {
      ...DefaultAttribute,
      code: 'userName',
      name: 'User Name',
      type: 'Text',
      column: 'user_name',
      maxLength: 128,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'forcePasswordChange',
      name: 'Force Password Change',
      type: 'Boolean',
      column: 'force_password_change',
    },
    {
      ...DefaultCalculatedAttribute,
      code: 'password',
      name: 'Password',
      type: 'Text',
      select: false,
      query: false,
      update: false,
    },
    {
      ...DefaultCalculatedAttribute,
      code: 'sendNewUserEmail',
      name: 'Send New User Email',
      type: 'Boolean',
      select: false,
      query: false,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
    {
      ...DefaultFullAccess,
      roleCode: 'USER_ADMIN',
    },
  ],
  beforeInsert: async ({ rows, client }) => {
    for (const row of rows) {
      row.failedLoginAttempts = 0;
      row.previousPasswordHashes = [];
      row.locked = false;
      row.startDate = row.startDate ?? new Date().toISOString();
      row.settings = row.settings ?? {};
      row.userName = row.userName.toLowerCase().trim();
      row.email = row.email.toLowerCase().trim();
      row.settings.theme = 'light';
      let newPassword = null;
      if (row.password) {
        row.passwordHash = await hashPassword(row.password);
        newPassword = row.password;
      }
      if (row.sendNewUserEmail) {
        if (row.passwordHash == null) {
          newPassword = generateStrongPassword();
          row.passwordHash = await hashPassword(newPassword);
        }
        if (newPassword) {
          await sendNewUserEmail({
            client,
            email: row.email,
            userName: row.userName,
            password: newPassword,
            isInternal: true,
          });
        }
      } else if (row.passwordHash == null) {
        throw new UserError('Password is required when sendNewUserEmail is false!');
      }
    }
    return { rows };
  },
  afterUpdate: async ({ rows, client }) => {
    for (const row of rows) {
      if (row.forcePasswordChange || row.locked || (row.endDate && isPast(parseISO(row.endDate)))) {
        await signOutAllUserSessions(client, row.userName);
      }
    }
    return rows;
  },
};
//# sourceMappingURL=UsersDS.js.map
