/* Copyright (c) 2024-present Venky Corp. */
import { DatabaseError } from 'pg';
import logger from '../../../lib/core/server/logger';
import { isUserError } from '../../../lib/core/common/error';
const ADMIN_ROLES = ['admin', 'app_admin'];
function isAdminSession(session) {
  return session?.user?.roles?.some((role) => ADMIN_ROLES.includes(role)) ?? false;
}
/** Map of PostgreSQL error codes to user-friendly messages */
const PG_ERROR_MESSAGES = {
  23505: 'A record with this value already exists',
  23503: 'Cannot complete: related records exist',
  23502: 'A required field is missing',
  '42P01': 'Database configuration error',
  42703: 'Database configuration error',
  22001: 'Value exceeds maximum allowed length',
  '22P02': 'Invalid data format provided',
};
/**
 * Build a rich technical error message for admin users.
 * Includes error type, message, DB-specific details, and cause chain.
 */
function buildTechnicalMessage(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const parts = [];
  // Error type and message
  const errorType = error.constructor.name !== 'Error' ? error.constructor.name : error.name;
  if (errorType !== 'Error') {
    parts.push(`[${errorType}] ${error.message}`);
  } else {
    parts.push(error.message);
  }
  // PostgreSQL-specific details
  if (error instanceof DatabaseError) {
    if (error.code) parts.push(`Code: ${error.code}`);
    if (error.detail) parts.push(`Detail: ${error.detail}`);
    if (error.hint) parts.push(`Hint: ${error.hint}`);
    if (error.schema || error.table || error.column) {
      const location = [error.schema, error.table, error.column].filter(Boolean).join('.');
      parts.push(`Location: ${location}`);
    }
    if (error.constraint) parts.push(`Constraint: ${error.constraint}`);
  }
  // Error cause chain (ES2022)
  if (error.cause instanceof Error) {
    const causeMsg = buildTechnicalMessage(error.cause);
    parts.push(`Caused by: ${causeMsg}`);
  }
  return parts.join(' | ');
}
/**
 * Get user-friendly message for known PostgreSQL errors.
 * Returns null if error code is not recognized.
 */
function getUserFriendlyDbMessage(error) {
  return error.code ? (PG_ERROR_MESSAGES[error.code] ?? null) : null;
}
/**
 * Creates an error response with appropriate message based on user role.
 * - UserError: Always shown to user (intentionally user-facing)
 * - DatabaseError: User-friendly message for known codes, technical for admins
 * - Other errors: Technical details for admins, sanitized for regular users
 */
export function createErrorResponse(error, session) {
  // UserError is always shown to users (intentionally user-facing)
  if (isUserError(error)) {
    return { status: 'ERROR', message: error.message };
  }
  const isAdmin = isAdminSession(session);
  // Handle database errors
  if (error instanceof DatabaseError) {
    const userFriendlyMessage = getUserFriendlyDbMessage(error);
    // For admins: always show technical details
    if (isAdmin) {
      logger.error(error);
      return { status: 'ERROR', message: buildTechnicalMessage(error) };
    }
    // For non-admins: show user-friendly message if available
    if (userFriendlyMessage) {
      logger.error(error);
      return { status: 'ERROR', message: userFriendlyMessage };
    }
  }
  // Log all unexpected errors
  logger.error(error);
  // For admins: show full technical details
  if (isAdmin) {
    return { status: 'ERROR', message: buildTechnicalMessage(error) };
  }
  // For non-admins: return sanitized message
  return { status: 'ERROR', message: 'An unexpected error occurred. Please try again or contact support.' };
}
//# sourceMappingURL=error-response.js.map
