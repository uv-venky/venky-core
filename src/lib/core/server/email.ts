'use server';

import type nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import logger from '@/lib/core/server/logger';
import { getConfig } from '@/lib/core/server/config';
import { getErrorMessage } from '@/lib/core/common/error';
import { sendQueuedEmails } from '@/lib/server/jobs/handlers/send-email';
import path from 'node:path';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import { PREFIX } from '@/lib/server/constants';
import { encrypt } from '@/lib/core/server/secure';
import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { truncateString } from '@/lib/utils/string';
import { getServer } from '@/lib/core/server/getServer';

let transporter: nodemailer.Transporter | null = null;

async function getNodemailer(): Promise<typeof nodemailer> {
  return (await import('nodemailer')).default;
}

function extractAddress(addr: string | Mail.Address | Array<string | Mail.Address> | undefined): string | null {
  if (!addr) return null;
  if (typeof addr === 'string') return addr;
  if (Array.isArray(addr)) {
    return addr.map((a) => (typeof a === 'string' ? a : a.address)).join(', ');
  }
  return addr.address;
}

function addressToString(to?: string | Mail.Address | (string | Mail.Address)[]): string | undefined {
  if (!to) return undefined;
  if (typeof to === 'string') return to;
  if (Array.isArray(to)) {
    if (to.length === 0) return undefined;
    const addresses = to.map((a) => (typeof a === 'string' ? a : a.address)).join(', ');
    return addresses;
  }
  return to.address;
}

interface VenkyQueuedMailOptions extends Mail.Options {
  /** When set, HTML is rendered from email-templates at send time (not when queued). */
  _venkyTemplate?: string;
  _venkyTemplateContext?: Record<string, unknown>;
}

async function resolveQueuedMailOptions(options: VenkyQueuedMailOptions): Promise<Mail.Options> {
  const { _venkyTemplate, _venkyTemplateContext, text: _text, ...rest } = options;
  if (!_venkyTemplate) {
    return options;
  }
  return {
    ...rest,
    html: await renderTemplate(_venkyTemplate, _venkyTemplateContext ?? {}),
  };
}

export async function sendEmailNow(allOptions: Mail.Options) {
  let options = await resolveQueuedMailOptions(allOptions as VenkyQueuedMailOptions);
  if (process.env.PRODUCTION_EMAILS !== 'true' || process.env.NODE_ENV !== 'production') {
    if (!process.env.TEST_EMAIL) {
      throw new Error('TEST_EMAIL is not set!');
    }
    const { to, cc, bcc, subject, ...rest } = options;
    options = {
      ...rest,
      to: process.env.TEST_EMAIL,
      subject: `[TEST] ${subject ?? 'No subject'}`,
    };

    if (options.text) {
      const toStr = addressToString(to);
      const ccStr = addressToString(cc);
      const bccStr = addressToString(bcc);
      const disclaimer = `This email is a test email and was not sent to the intended recipients.
Intended recipients:${toStr ? `\nTo: ${toStr}` : ''}${ccStr ? `\nCC: ${ccStr}` : ''}${bccStr ? `\nBCC: ${bccStr}` : ''}`;
      options.text = `${options.text}

---
${disclaimer}
---`;
    }
    if (options.html) {
      const toStr = addressToString(to);
      const ccStr = addressToString(cc);
      const bccStr = addressToString(bcc);
      const disclaimer = `This email is a test email and was not sent to the intended recipients.
Intended recipients:${toStr ? `<br/>To: ${toStr}` : ''}${ccStr ? `<br/>CC: ${ccStr}` : ''}${bccStr ? `<br/>BCC: ${bccStr}` : ''}`;
      options.html = `${options.html}
      <p>${disclaimer}</p>`;
    }
  }
  const config = getConfig('email');
  if (!config.smtp?.host) {
    throw new Error('SMTP not configured — check smtp.host in config');
  }
  if (!transporter) {
    const nm = await getNodemailer();
    transporter = nm.createTransport(config.smtp);
  }
  if (!options.from && config.smtp.from) {
    options.from = config.smtp.from;
  }
  if (!options.from) {
    throw new Error('No from address configured!');
  }
  const _info = await transporter.sendMail(options);

  // logger.debug('Message sent: %s', info.messageId);
}

let timeout: NodeJS.Timeout | null = null;

export async function sendEmail(options: Mail.Options, client: PgPoolClient) {
  try {
    const config = getConfig('sendEmail');
    const { appId, schedulerId } = config;
    const _to = extractAddress(options.to);
    const to = truncateString(_to, 255);
    const subject = truncateString(options.subject ?? null, 255);
    if (subject !== options.subject) {
      logger.warn('Subject truncated', { subject, original: options.subject });
    }
    if (to !== _to) {
      logger.warn('To address truncated', { to, original: _to });
    }
    await client.query(
      `INSERT INTO ${PREFIX}email_requests (to_address, subject, mail_options, app_id, scheduler_id) VALUES ($1, $2, $3, $4, $5)`,
      [to, subject, JSON.stringify(options), appId, schedulerId],
    );
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      sendQueuedEmails();
    }, 3000);
  } catch (e) {
    logger.error('Failed to queue email', getErrorMessage(e));
    logger.error(JSON.stringify(options));
    throw e;
  }
}

const templateCache = new Map<string, { mtimeMs: number; compiled: Handlebars.TemplateDelegate }>();

async function loadTemplate(name: string): Promise<Handlebars.TemplateDelegate> {
  const filePath = path.join(process.cwd(), 'email-templates', `${name}.html`);
  const stat = await fs.stat(filePath);
  const cached = templateCache.get(name);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.compiled;
  }
  const raw = await fs.readFile(filePath, 'utf8');
  const compiled = Handlebars.compile(raw);
  templateCache.set(name, { mtimeMs: stat.mtimeMs, compiled });
  return compiled;
}

async function renderTemplate(name: string, context: Record<string, unknown>): Promise<string> {
  const template = await loadTemplate(name);
  return template(context);
}

export async function sendEmailWithTemplate({
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
}) {
  await sendEmail(
    {
      to,
      cc,
      subject,
      attachments,
      _venkyTemplate: template,
      _venkyTemplateContext: context,
    } as VenkyQueuedMailOptions,
    client,
  );
}

/**
 * Send a test email to the current user. Call via useMutation('sendTestEmail').
 * Requires (client, session) from the action registry.
 */
export async function sendTestEmailWithSession(client: PgPoolClient, session: Session): Promise<void> {
  const { email, userName } = session.user;
  if (!email) {
    throw new Error('Email not found');
  }
  await sendNewUserEmail({
    email,
    userName,
    password: 'testing',
    isInternal: true,
    client,
  });
}

const DEFAULT_NEW_USER_SUBJECT = 'Welcome To Metro One Dashboard';

export async function sendNewUserEmail({
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
}) {
  const basePath = process.cwd();
  let subject = DEFAULT_NEW_USER_SUBJECT;
  try {
    const server = getServer('sendNewUserEmail');
    subject = isInternal
      ? (server.config.newUserEmailSubjectInternal ?? DEFAULT_NEW_USER_SUBJECT)
      : (server.config.newUserEmailSubject ?? DEFAULT_NEW_USER_SUBJECT);
  } catch {
    // Server not yet initialized (e.g. tests)
  }
  await sendEmailWithTemplate({
    client,
    to: email,
    subject,
    template: isInternal ? 'new-user-internal' : 'new-user',
    context: {
      url: process.env.APP_URL ?? 'https://APP_URL.missing',
      userName: userName,
      password: password,
      accountId: accountId,
      subject, // Exposed for template use
      year: new Date().getFullYear(),
    },
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(basePath, 'email-templates', 'logo.png'),
        cid: 'logo_cid', // same as in the img src
      },
    ],
  });
}

export async function bulkQueueNewUserEmails({
  users,
  isInternal,
  client,
}: {
  users: { email: string; userName: string; password: string; accountId?: string }[];
  isInternal: boolean;
  client: PgPoolClient;
}) {
  if (users.length === 0) return;

  const basePath = process.cwd();
  let subject = DEFAULT_NEW_USER_SUBJECT;
  try {
    const server = getServer('bulkQueueNewUserEmails');
    subject = isInternal
      ? (server.config.newUserEmailSubjectInternal ?? DEFAULT_NEW_USER_SUBJECT)
      : (server.config.newUserEmailSubject ?? DEFAULT_NEW_USER_SUBJECT);
  } catch {
    // Server not yet initialized (e.g. tests)
  }

  const templateName = isInternal ? 'new-user-internal' : 'new-user';
  const template = await loadTemplate(templateName);
  const appUrl = process.env.APP_URL ?? 'https://APP_URL.missing';
  const year = new Date().getFullYear();
  const attachments = [
    {
      filename: 'logo.png',
      path: path.join(basePath, 'email-templates', 'logo.png'),
      cid: 'logo_cid',
    },
  ];

  const config = getConfig('sendEmail');
  const { appId, schedulerId } = config;

  const valueClauses: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  for (const user of users) {
    const html = template({
      url: appUrl,
      userName: user.userName,
      password: user.password,
      accountId: user.accountId,
      subject,
      year,
    });
    const mailOptions: Mail.Options = {
      to: user.email,
      subject,
      html,
      attachments,
    };
    const toAddr = truncateString(user.email, 255);
    const subj = truncateString(subject, 255);
    valueClauses.push(`($${i}, $${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`);
    params.push(toAddr, subj, JSON.stringify(mailOptions), appId, schedulerId);
    i += 5;
  }

  try {
    await client.query(
      `INSERT INTO ${PREFIX}email_requests (to_address, subject, mail_options, app_id, scheduler_id) VALUES ${valueClauses.join(', ')}`,
      params,
    );
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      sendQueuedEmails();
    }, 3000);
  } catch (e) {
    logger.error('Failed to bulk queue emails', getErrorMessage(e));
    throw e;
  }
}

export async function sendPasswordResetEmail({
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
}) {
  const basePath = process.cwd();
  const json = JSON.stringify({ token, key, email, userName });
  const tkn = await encrypt(json);
  // base64 encode the token
  const base64Token = Buffer.from(tkn).toString('base64');

  const redirectUrl = new URL(`/login/reset-password/${base64Token}`, process.env.APP_URL ?? 'https://APP_URL.missing');

  const url = redirectUrl.toString();
  await sendEmailWithTemplate({
    client,
    to: email,
    subject: 'Password Reset Request',
    template: 'password-reset',
    context: {
      url,
    },
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(basePath, 'email-templates', 'logo.png'),
        cid: 'logo_cid',
      },
    ],
  });
}
