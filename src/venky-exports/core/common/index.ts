/* Copyright (c) 2024-present Venky Corp. */

// Re-export common utilities
export * from '@/lib/core/common/date-utils';
export * from '@/lib/core/common/deepUtils';
export * from '@/lib/core/common/error';
export * from '@/lib/core/common/hash';
export * from '@/lib/core/common/isEmpty';
export * from '@/lib/core/common/normalizeTextFieldWhitespace';
export * from '@/lib/core/common/uuid';

// Re-export common types
export * from '@/lib/core/common/types/Store';
export * from '@/lib/core/common/types/UserSession';
export * from '@/lib/core/common/types/UserSettings';

// Re-export all DataSource types from @/lib/core/common/ds/types
export * from '@/lib/core/common/ds/types/attribute-utils';
export * from '@/lib/core/common/ds/types/Attribute';
export * from '@/lib/core/common/ds/types/AttributeType';
export * from '@/lib/core/common/ds/types/BooleanFilter';
export * from '@/lib/core/common/ds/types/DataSource';
export * from '@/lib/core/common/ds/types/DataSourceAccess';
export * from '@/lib/core/common/ds/types/DatasourceType';
export * from '@/lib/core/common/ds/types/DateFilter';
export * from '@/lib/core/common/ds/types/DBType';
export * from '@/lib/core/common/ds/types/DSPost';
export * from '@/lib/core/common/ds/types/ExternalDatasource';
export * from '@/lib/core/common/ds/types/filter';
export * from '@/lib/core/common/ds/types/MultiDateFilter';
export * from '@/lib/core/common/ds/types/MultiNumberFilter';
export * from '@/lib/core/common/ds/types/MultiStringFilter';
export * from '@/lib/core/common/ds/types/MultiUUIDFilter';
export * from '@/lib/core/common/ds/types/NumberFilter';
export * from '@/lib/core/common/ds/types/RecordStatus';
export * from '@/lib/core/common/ds/types/ReferenceMapping';
export * from '@/lib/core/common/ds/types/ReferenceMetadata';
export * from '@/lib/core/common/ds/types/StringFilter';
export * from '@/lib/core/common/ds/types/Transaction';
export * from '@/lib/core/common/ds/types/TransactionMapping';
export * from '@/lib/core/common/ds/types/UUIDFilter';
export * from '@/lib/core/common/ds/types/YN';
export * from '@/lib/core/common/ds/types/YNFilter';
export type { FieldDef, QueryResult } from '@/lib/core/server/ds/ds_types';
export type { Users } from '@/lib/common/ds/types/core/Users';
export type { Audit } from '@/lib/common/ds/types/core/Audit';
export type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
export type { UserSessions } from '@/lib/common/ds/types/core/UserSessions';
export type { Logs } from '@/lib/common/ds/types/core/Logs';
export type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
export type { UserList } from '@/lib/common/ds/types/core/UserList';
export type { Roles } from '@/lib/common/ds/types/core/Roles';
export type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
export type { UserActivity } from '@/lib/common/ds/types/core/UserActivity';
export type { UserAvatar } from '@/lib/common/ds/types/core/UserAvatar';
export type { SavedSearchPayload } from '@/lib/common/ds/types/core/SavedSearch';
export type { RecurrenceType } from '@/lib/core/common/schedule-utils';
export { calculateNextRunAt } from '@/lib/core/common/schedule-utils';
export { getPasswordRequirements } from '@/lib/common/password-utils';
export type { ValidPasswordResetTokenType } from '@/lib/core/common/types/PasswordReset';

// Deployment configuration types
export type {
  DeployEnvironment,
  DeployConfig,
  DeployConfigMap,
} from '@/lib/core/common/types/DeployConfig';

export {
  DefaultAttribute,
  DefaultDataSource,
  DefaultFullAccess,
  DefaultReadOnlyAccess,
} from '@/lib/core/common/ds/types/Defaults';

export * from '@/lib/feedback/common';
