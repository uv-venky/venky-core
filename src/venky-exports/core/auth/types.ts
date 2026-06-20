/* Copyright (c) 2024-present Venky Corp. */

/**
 * Client-safe auth types export
 * This module exports only types (no runtime code) and is safe to use in client components
 */

// Re-export auth types
export type { User, Session } from '@/lib/core/common/types/Auth';

// Re-export related types
export type { UserSettings, Position, LogLevel } from '@/lib/core/common/types/UserSettings';

// Re-export Google OAuth types (these are just interfaces, no runtime code)
export type { GoogleTokens, GoogleUserInfo } from '@/lib/google-oauth';
