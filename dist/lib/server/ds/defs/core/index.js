import { RolesDS } from './RolesDS';
import { UsersDS } from './UsersDS';
import { UserRolesDS } from './UserRolesDS';
import { UserActivityDS } from './UserActivityDS';
import { UserActivityArchiveDS } from './UserActivityArchiveDS';
import { UserAvatarDS } from './UserAvatarDS';
import { AuditDataSource } from './AuditDataSource';
import { SavedSearchDataSource } from './SavedSearchDataSource';
import { UserSessionsDataSource } from './UserSessionsDataSource';
import { LogsDS } from './LogsDS';
import { EmailRequestsDataSource } from './EmailRequestsDataSource';
import { UserListDS } from './UserListDS';
import { AppsDS } from './AppsDS';
import { LookupTypesDS } from './LookupTypesDS';
import { LookupValuesDS } from './LookupValuesDS';
export const COREDataSources = {
  Apps: AppsDS,
  Audit: AuditDataSource,
  EmailRequests: EmailRequestsDataSource,
  Logs: LogsDS,
  LookupTypes: LookupTypesDS,
  LookupValues: LookupValuesDS,
  Roles: RolesDS,
  SavedSearch: SavedSearchDataSource,
  UserActivity: UserActivityDS,
  UserActivityArchive: UserActivityArchiveDS,
  UserAvatar: UserAvatarDS,
  UserList: UserListDS,
  UserRoles: UserRolesDS,
  UserSessions: UserSessionsDataSource,
  Users: UsersDS,
};
//# sourceMappingURL=index.js.map
