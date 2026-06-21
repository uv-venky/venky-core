import type Mail from 'nodemailer/lib/mailer';
import type { PgPoolClient } from '../../../lib/core/server/db';
import type { Session } from '../../../auth';
export declare function sendEmailNow(allOptions: Mail.Options): Promise<void>;
export declare function sendEmail(options: Mail.Options, client: PgPoolClient): Promise<void>;
export declare function sendEmailWithTemplate({
  template,
  context,
  to,
  cc,
  subject,
  attachments,
  client,
}: {
  template: string;
  context: Record<string, unknown>;
  to: string | string[];
  cc?: string | string[];
  subject: string;
  attachments: Mail.Attachment[];
  client: PgPoolClient;
}): Promise<void>;
/**
 * Send a test email to the current user. Call via useMutation('sendTestEmail').
 * Requires (client, session) from the action registry.
 */
export declare function sendTestEmailWithSession(client: PgPoolClient, session: Session): Promise<void>;
export declare function sendNewUserEmail({
  email,
  userName,
  password,
  accountId,
  isInternal,
  client,
}: {
  email: string;
  userName: string;
  password: string;
  accountId?: string;
  isInternal: boolean;
  client: PgPoolClient;
}): Promise<void>;
export declare function bulkQueueNewUserEmails({
  users,
  isInternal,
  client,
}: {
  users: {
    email: string;
    userName: string;
    password: string;
    accountId?: string;
  }[];
  isInternal: boolean;
  client: PgPoolClient;
}): Promise<void>;
export declare function sendPasswordResetEmail({
  email,
  token,
  key,
  userName,
  client,
}: {
  email: string;
  token: string;
  key: string;
  userName: string;
  client: PgPoolClient;
}): Promise<void>;
//# sourceMappingURL=email.d.ts.map
