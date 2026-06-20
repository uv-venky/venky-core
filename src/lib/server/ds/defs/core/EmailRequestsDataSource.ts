import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '../defaults';
import type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
import { getPrefix } from '@/lib/server/constants';
const PREFIX = getPrefix();

export const EmailRequestsDataSource: DataSource<EmailRequests> = {
  ...DefaultDataSource,
  id: 'EmailRequests',
  tableName: `${PREFIX}email_requests`,
  attributes: [
    {
      ...DefaultAttribute,
      code: 'requestId',
      name: 'Request Id',
      type: 'Number',
      column: 'request_id',
      primary: true,
      optional: false,
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'toAddress',
      name: 'To Address',
      type: 'Text',
      column: 'to_address',
      maxLength: 255,
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'subject',
      name: 'Subject',
      type: 'Text',
      column: 'subject',
      maxLength: 255,
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'mailOptions',
      name: 'Mail Options',
      type: 'JSON',
      column: 'mail_options',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'attemptCount',
      name: 'Attempt Count',
      type: 'Number',
      column: 'attempt_count',
      optional: false,
      excludeTime: true,
    },
    {
      ...DefaultAttribute,
      code: 'lastError',
      name: 'Last Error',
      type: 'Text',
      column: 'last_error',
    },
    {
      ...DefaultAttribute,
      code: 'nextAttemptAt',
      name: 'Next Attempt At',
      type: 'Date',
      column: 'next_attempt_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'sentAt',
      name: 'Sent At',
      type: 'Date',
      column: 'sent_at',
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
      code: 'appId',
      name: 'App Id',
      type: 'Text',
      column: 'app_id',
      maxLength: 128,
      optional: false,
      defaultValue: 'APP_ID',
    },
    {
      ...DefaultAttribute,
      code: 'schedulerId',
      name: 'Scheduler Id',
      type: 'Text',
      column: 'scheduler_id',
      maxLength: 128,
      optional: false,
      defaultValue: 'SCHEDULER_ID',
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};
