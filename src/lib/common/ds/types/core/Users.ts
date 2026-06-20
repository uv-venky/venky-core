import type { ISODateTimeString } from '@/lib/core/common/ds/types/DataSource';
import type { UserSettings } from '@/lib/core/common/types/UserSettings';

export interface Users {
  apiKey?: string | null;
  apiSecret?: string | null;
  createdAt: ISODateTimeString;
  createdBy: string;
  displayName: string;
  email: string;
  endDate?: ISODateTimeString | null;
  failedLoginAttempts: number;
  forcePasswordChange?: boolean;
  ipAddress?: string | null;
  lastFailedLogin?: ISODateTimeString | null;
  lastFailedLoginIpAddress?: string | null;
  lastLogin?: ISODateTimeString | null;
  lastPasswordReset?: ISODateTimeString | null;
  lastPasswordResetBy?: string | null;
  lastPasswordResetIpAddress?: string | null;
  locationName?: string | null;
  locked: boolean;
  passwordHash?: string;
  picture?: string | null;
  previousPasswordHashes: string[]; // jsonb
  settings: UserSettings; // jsonb
  startDate: ISODateTimeString;
  updatedAt: ISODateTimeString;
  updatedBy: string;
  userId?: number | null;
  userName: string;
  password?: string | null;
  sendNewUserEmail?: boolean;
  state?: { statecode: string; selected: string }[] | null; // <-- update type to match COPUsers
}
