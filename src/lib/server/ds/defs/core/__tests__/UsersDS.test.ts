/** biome-ignore-all lint/style/noNonNullAssertion: ok for tests */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { UsersDS } from '../UsersDS';
import type { Users } from '@/lib/common/ds/types/core/Users';
import type { DBRow } from '@/lib/core/common/ds/types/filter';
import type { Session } from '@/auth';
import type { PgPoolClient } from '@/lib/core/server/db';
import { hashPassword } from '@/auth';
import { sendNewUserEmail } from '@/lib/core/server/email';
import { UserError } from '@/lib/core/common/error';
import { PREFIX } from '@/lib/server/constants';

// Mock dependencies
vi.mock('@/auth', () => ({
  hashPassword: vi.fn(),
}));

vi.mock('@/lib/core/server/email', () => ({
  sendNewUserEmail: vi.fn(),
}));

describe('UsersDS', () => {
  // Mock session and client for testing
  const mockSession: Session = {
    id: 'test-session-id',
    user: {
      userName: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['admin'],
      settings: {
        theme: 'light' as const,
      },
    },
    expires: new Date(Date.now() + 1000 * 300).toISOString(),
  };

  const mockClient = {} as PgPoolClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure mocks are properly set up
    (hashPassword as any).mockResolvedValue('hashed_password_123');
    (sendNewUserEmail as any).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data Source Structure', () => {
    test('should have correct basic properties', () => {
      expect(UsersDS.id).toBe('Users');

      expect((UsersDS as any).tableName).toBe(`${PREFIX}users`);
      expect(UsersDS.attributes).toBeDefined();
      expect(UsersDS.access).toBeDefined();
    });

    test('should have correct access control', () => {
      expect(UsersDS.access).toHaveLength(2);
      expect(UsersDS.access[0].roleCode).toBe('admin');
      expect(UsersDS.access[1].roleCode).toBe('USER_ADMIN');
    });

    test('should have beforeInsert function', () => {
      expect(UsersDS.beforeInsert).toBeDefined();
      expect(typeof UsersDS.beforeInsert).toBe('function');
    });
  });

  describe('Sensitive Column Protection', () => {
    const sensitiveColumns = [
      { code: 'apiKey', name: 'Api Key' },
      { code: 'apiSecret', name: 'Api Secret' },
      { code: 'passwordHash', name: 'Password Hash' },
      { code: 'previousPasswordHashes', name: 'Previous Password Hashes' },
      // { code: 'settings', name: 'Settings' },
      { code: 'picture', name: 'Picture' },
    ];

    test.each(sensitiveColumns)('should protect sensitive column $name ($code)', ({ code }) => {
      const attribute = UsersDS.attributes.find((attr) => attr.code === code);
      expect(attribute).toBeDefined();
      expect(attribute?.select).toBe(false);
      expect(attribute?.query).toBe(false);
      expect(attribute?.update).toBe(false);
    });

    test('should have all sensitive columns marked as non-selectable', () => {
      const sensitiveAttributes = UsersDS.attributes.filter((attr) =>
        ['apiKey', 'apiSecret', 'passwordHash', 'previousPasswordHashes', 'picture'].includes(attr.code),
      );

      sensitiveAttributes.forEach((attr) => {
        expect(attr.select).toBe(false);
        expect(attr.query).toBe(false);
        expect(attr.update).toBe(false);
      });
    });

    test('should have password calculated attribute protected', () => {
      const passwordAttr = UsersDS.attributes.find((attr) => attr.code === 'password');
      expect(passwordAttr).toBeDefined();
      expect(passwordAttr?.select).toBe(false);
      expect(passwordAttr?.query).toBe(false);
      expect(passwordAttr?.update).toBe(false);
    });

    test('should have sendNewUserEmail calculated attribute protected', () => {
      const emailAttr = UsersDS.attributes.find((attr) => attr.code === 'sendNewUserEmail');
      expect(emailAttr).toBeDefined();
      expect(emailAttr?.select).toBe(false);
      expect(emailAttr?.query).toBe(false);
    });
  });

  describe('Attribute Configuration', () => {
    test('should have userName as primary key', () => {
      const userNameAttr = UsersDS.attributes.find((attr) => attr.code === 'userName');
      expect(userNameAttr?.primary).toBe(true);
      expect(userNameAttr?.optional).toBe(false);
    });

    test('should have required attributes marked as non-optional', () => {
      const requiredAttributes = [
        'createdAt',
        'createdBy',
        'displayName',
        'email',
        'failedLoginAttempts',
        'locked',
        'startDate',
        'updatedAt',
        'updatedBy',
        'userName',
      ];

      requiredAttributes.forEach((code) => {
        const attr = UsersDS.attributes.find((attr) => attr.code === code);
        expect(attr?.optional).toBe(false);
      });
    });

    test('should have correct data types', () => {
      const typeChecks = [
        { code: 'apiKey', expectedType: 'Text' },
        { code: 'apiSecret', expectedType: 'Text' },
        { code: 'createdAt', expectedType: 'Date' },
        { code: 'createdBy', expectedType: 'Text' },
        { code: 'displayName', expectedType: 'Text' },
        { code: 'email', expectedType: 'Text' },
        { code: 'endDate', expectedType: 'Date' },
        { code: 'failedLoginAttempts', expectedType: 'Number' },
        { code: 'ipAddress', expectedType: 'Text' },
        { code: 'lastFailedLogin', expectedType: 'Date' },
        { code: 'lastFailedLoginIpAddress', expectedType: 'Text' },
        { code: 'lastLogin', expectedType: 'Date' },
        { code: 'lastPasswordReset', expectedType: 'Date' },
        { code: 'lastPasswordResetBy', expectedType: 'Text' },
        { code: 'lastPasswordResetIpAddress', expectedType: 'Text' },
        { code: 'locationName', expectedType: 'Text' },
        { code: 'locked', expectedType: 'Boolean' },
        { code: 'passwordHash', expectedType: 'Text' },
        { code: 'picture', expectedType: 'Text' },
        { code: 'previousPasswordHashes', expectedType: 'JSON' },
        { code: 'settings', expectedType: 'JSON' },
        { code: 'startDate', expectedType: 'Date' },
        { code: 'updatedAt', expectedType: 'Date' },
        { code: 'updatedBy', expectedType: 'Text' },
        { code: 'userId', expectedType: 'Number' },
        { code: 'userName', expectedType: 'Text' },
        { code: 'password', expectedType: 'Text' },
        { code: 'sendNewUserEmail', expectedType: 'Boolean' },
      ];

      typeChecks.forEach(({ code, expectedType }) => {
        const attr = UsersDS.attributes.find((attr) => attr.code === code);
        expect(attr?.type).toBe(expectedType);
      });
    });

    test('should have correct maxLength for text fields', () => {
      const maxLengthChecks = [
        { code: 'apiKey', expectedMaxLength: 256 },
        { code: 'apiSecret', expectedMaxLength: 256 },
        { code: 'createdBy', expectedMaxLength: 128 },
        { code: 'displayName', expectedMaxLength: 128 },
        { code: 'email', expectedMaxLength: 128 },
        { code: 'ipAddress', expectedMaxLength: 128 },
        { code: 'lastFailedLoginIpAddress', expectedMaxLength: 128 },
        { code: 'lastPasswordResetBy', expectedMaxLength: 128 },
        { code: 'lastPasswordResetIpAddress', expectedMaxLength: 128 },
        { code: 'locationName', expectedMaxLength: 128 },
        { code: 'passwordHash', expectedMaxLength: 256 },
        { code: 'updatedBy', expectedMaxLength: 128 },
        { code: 'userName', expectedMaxLength: 128 },
      ];

      maxLengthChecks.forEach(({ code, expectedMaxLength }) => {
        const attr = UsersDS.attributes.find((attr) => attr.code === code);
        expect(attr?.maxLength).toBe(expectedMaxLength);
      });
    });
  });

  describe('beforeInsert Functionality', () => {
    const mockHashPassword = hashPassword as any;
    const mockSendNewUserEmail = sendNewUserEmail as any;

    beforeEach(() => {
      mockHashPassword.mockResolvedValue('hashed_password_123');
      mockSendNewUserEmail.mockResolvedValue();
    });

    test('should set default values for new users', async () => {
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          password: 'testpassword',
          sendNewUserEmail: false,
        },
      ];

      const result = await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(result).toBeDefined();
      expect(result!.rows[0].failedLoginAttempts).toBe(0);
      expect(result!.rows[0].previousPasswordHashes).toEqual([]);
      expect(result!.rows[0].locked).toBe(false);
      expect(result!.rows[0].startDate).toBeDefined();
      expect(result!.rows[0].settings).toEqual({ theme: 'light' });
      expect(mockHashPassword).toHaveBeenCalledWith('testpassword');
      expect(result!.rows[0].passwordHash).toBe('hashed_password_123');
    });

    test('should generate password when sendNewUserEmail is true', async () => {
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: true,
        },
      ];

      const result = await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(mockHashPassword).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result!.rows[0].passwordHash).toBe('hashed_password_123');
      expect(mockSendNewUserEmail).toHaveBeenCalledWith({
        client: mockClient,
        email: 'test@example.com',
        userName: 'testuser',
        password: expect.any(String),
        isInternal: true,
      });
    });

    test('should throw error when password is required but not provided', async () => {
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: false,
        },
      ];

      await expect(
        UsersDS.beforeInsert?.({
          rows: rows as DBRow<Users>[],
          session: mockSession,
          client: mockClient,
        }),
      ).rejects.toThrow(UserError);
      await expect(
        UsersDS.beforeInsert?.({
          rows: rows as DBRow<Users>[],
          session: mockSession,
          client: mockClient,
        }),
      ).rejects.toThrow('Password is required when sendNewUserEmail is false!');
    });

    test('should handle multiple rows', async () => {
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'user1',
          email: 'user1@example.com',
          displayName: 'User 1',
          createdBy: 'admin',
          updatedBy: 'admin',
          password: 'password1',
          sendNewUserEmail: false,
        },
        {
          userName: 'user2',
          email: 'user2@example.com',
          displayName: 'User 2',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: true,
        },
      ];

      const result = await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(result).toBeDefined();
      expect(result!.rows).toHaveLength(2);
      expect(result!.rows[0].failedLoginAttempts).toBe(0);
      expect(result!.rows[1].failedLoginAttempts).toBe(0);
      expect(mockHashPassword).toHaveBeenCalledTimes(2);
      expect(mockSendNewUserEmail).toHaveBeenCalledTimes(1);
    });

    test('should use existing startDate if provided', async () => {
      const customStartDate = '2023-01-01T00:00:00.000Z';
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          password: 'testpassword',
          sendNewUserEmail: false,
          startDate: customStartDate,
        },
      ];

      const result = await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(result).toBeDefined();
      expect(result!.rows[0].startDate).toBe(customStartDate);
    });

    test('should use existing settings if provided', async () => {
      const customSettings = { theme: 'dark' as const };
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          password: 'testpassword',
          sendNewUserEmail: false,
          settings: customSettings,
        },
      ];

      const result = await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(result).toBeDefined();
      expect(result!.rows[0].settings).toEqual(customSettings);
    });
  });

  describe('Password Generation', () => {
    test('should generate strong password with default parameters', () => {
      // This tests the generateStrongPassword function indirectly through beforeInsert
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: true,
        },
      ];

      return expect(
        UsersDS.beforeInsert?.({
          rows: rows as DBRow<Users>[],
          session: mockSession,
          client: mockClient,
        }),
      ).resolves.toBeDefined();
    });

    test('should handle password generation error gracefully', async () => {
      // Mock hashPassword to throw an error
      const mockHashPassword = hashPassword as any;
      mockHashPassword.mockRejectedValue(new Error('Hash error'));

      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: true,
        },
      ];

      await expect(
        UsersDS.beforeInsert?.({
          rows: rows as DBRow<Users>[],
          session: mockSession,
          client: mockClient,
        }),
      ).rejects.toThrow('Hash error');
    });
  });

  describe('Email Sending', () => {
    const mockSendNewUserEmail = sendNewUserEmail as any;

    test('should send email with correct parameters', async () => {
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: true,
        },
      ];

      await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(mockSendNewUserEmail).toHaveBeenCalledWith({
        client: mockClient,
        email: 'test@example.com',
        userName: 'testuser',
        password: expect.any(String),
        isInternal: true,
      });
    });

    test('should not send email when sendNewUserEmail is false', async () => {
      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          password: 'testpassword',
          sendNewUserEmail: false,
        },
      ];

      await UsersDS.beforeInsert?.({
        rows: rows as DBRow<Users>[],
        session: mockSession,
        client: mockClient,
      });

      expect(hashPassword).toHaveBeenCalledWith('testpassword');
      expect(mockSendNewUserEmail).not.toHaveBeenCalled();
    });

    test('should handle email sending errors gracefully', async () => {
      mockSendNewUserEmail.mockRejectedValue(new Error('Email error'));

      const rows: Partial<DBRow<Users>>[] = [
        {
          userName: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          createdBy: 'admin',
          updatedBy: 'admin',
          sendNewUserEmail: true,
        },
      ];

      await expect(
        UsersDS.beforeInsert?.({
          rows: rows as DBRow<Users>[],
          session: mockSession,
          client: mockClient,
        }),
      ).rejects.toThrow('Email error');
    });
  });

  describe('Data Source Completeness', () => {
    test('should have all required attributes for Users type', () => {
      const expectedAttributes = [
        'apiKey',
        'apiSecret',
        'createdAt',
        'createdBy',
        'displayName',
        'email',
        'endDate',
        'failedLoginAttempts',
        'ipAddress',
        'lastFailedLogin',
        'lastFailedLoginIpAddress',
        'lastLogin',
        'lastPasswordReset',
        'lastPasswordResetBy',
        'lastPasswordResetIpAddress',
        'locationName',
        'locked',
        'passwordHash',
        'picture',
        'previousPasswordHashes',
        'settings',
        'startDate',
        'updatedAt',
        'updatedBy',
        'userId',
        'userName',
        'password',
        'sendNewUserEmail',
      ];

      const actualAttributes = UsersDS.attributes.map((attr) => attr.code);

      expectedAttributes.forEach((attr) => {
        expect(actualAttributes).toContain(attr);
      });
    });

    test('should have correct table name with prefix', () => {
      expect((UsersDS as any).tableName).toBe(`${PREFIX}users`);
    });

    test('should have proper column mappings', () => {
      const columnMappings = [
        { code: 'apiKey', column: 'api_key' },
        { code: 'apiSecret', column: 'api_secret' },
        { code: 'createdAt', column: 'created_at' },
        { code: 'createdBy', column: 'created_by' },
        { code: 'displayName', column: 'display_name' },
        { code: 'email', column: 'email' },
        { code: 'endDate', column: 'end_date' },
        { code: 'failedLoginAttempts', column: 'failed_login_attempts' },
        { code: 'ipAddress', column: 'ip_address' },
        { code: 'lastFailedLogin', column: 'last_failed_login' },
        {
          code: 'lastFailedLoginIpAddress',
          column: 'last_failed_login_ip_address',
        },
        { code: 'lastLogin', column: 'last_login' },
        { code: 'lastPasswordReset', column: 'last_password_reset' },
        { code: 'lastPasswordResetBy', column: 'last_password_reset_by' },
        {
          code: 'lastPasswordResetIpAddress',
          column: 'last_password_reset_ip_address',
        },
        { code: 'locationName', column: 'location_name' },
        { code: 'locked', column: 'locked' },
        { code: 'passwordHash', column: 'password_hash' },
        { code: 'picture', column: 'picture' },
        { code: 'previousPasswordHashes', column: 'previous_password_hashes' },
        { code: 'settings', column: 'settings' },
        { code: 'startDate', column: 'start_date' },
        { code: 'updatedAt', column: 'updated_at' },
        { code: 'updatedBy', column: 'updated_by' },
        { code: 'userId', column: 'user_id' },
        { code: 'userName', column: 'user_name' },
      ];

      columnMappings.forEach(({ code, column }) => {
        const attr = UsersDS.attributes.find((attr) => attr.code === code);
        expect(attr?.column).toBe(column);
      });
    });
  });
});
