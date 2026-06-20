import type Mail from 'nodemailer/lib/mailer';

export interface EmailRequests {
  appId: string;
  schedulerId: string;
  requestId: number;
  toAddress?: string | null;
  subject?: string | null;
  mailOptions: Mail.Options;
  attemptCount: number;
  lastError?: string | null;
  nextAttemptAt: string;
  sentAt?: string | null;
  createdAt: string;
}
