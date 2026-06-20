'use server';

import crypto from 'node:crypto';
import { getConfig } from '@/lib/core/server/config';
import { UserError } from '@/lib/core/common/error';

// Use a delimiter that won't appear in base64 and is safe for JSON
// Base64 uses: A-Z, a-z, 0-9, +, /, = (padding)
// So we use a character sequence that won't conflict
const DELIMITER = '\0';
const ALGORITHM = 'aes-256-gcm';

function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.scryptSync(password, salt, 32);
}

function getSecret(): string {
  const secret = getConfig('secret').secret?.trim();
  if (!secret) {
    throw new UserError('Application secret is not configured');
  }
  return secret;
}

export async function encrypt(text: string): Promise<string> {
  const salt = crypto.randomBytes(16); // Generate a random salt
  const key = deriveKeyFromPassword(getSecret(), salt);
  const iv = crypto.randomBytes(12); // IV length is 12 bytes for GCM mode
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  const encryptedString = [salt.toString('base64'), iv.toString('base64'), encrypted, authTag].join(DELIMITER);
  return Buffer.from(encryptedString, 'utf8').toString('base64');
}

async function decryptInner(encryptedText: string): Promise<string> {
  const parts = encryptedText.split(DELIMITER);

  if (parts.length !== 4) {
    throw new UserError('Invalid encrypted data format: expected 4 parts');
  }

  const [s, i, encrypted, a] = parts;

  if (!s || !i || !encrypted || !a) {
    throw new UserError('Invalid input to decrypt');
  }

  const salt = Buffer.from(s, 'base64');
  const iv = Buffer.from(i, 'base64');
  const authTag = Buffer.from(a, 'base64');
  const key = deriveKeyFromPassword(getSecret(), salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Decrypt text from a base64-encoded encrypted string.
 * Handles both base64-encoded (new) and non-base64-encoded (legacy) formats for backward compatibility.
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    // Try base64-decoding first (new format)
    try {
      const decoded = Buffer.from(encryptedText, 'base64').toString('utf8');
      // If base64 decode succeeds, try decrypting
      return await decryptInner(decoded);
    } catch {
      // If base64 decode fails or decrypt fails, try direct decrypt (legacy format)
      return await decryptInner(encryptedText);
    }
  } catch (error) {
    throw new UserError(`Failed to decrypt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
