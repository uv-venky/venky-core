/* Copyright (c) 2024-present Venky Corp. */
import { getErrorMessage } from '@/lib/core/common/error';
import { APP_VERSION } from '@/lib/app-info';
import { getConfig } from '@/lib/core/server/config';
import logger from '@/lib/core/server/logger';
import { getSystemInfo } from '@/lib/core/server/session';
import { getNodeRunId } from '@/lib/server/constants';

/**
 * Send an alert message to a Google Chat space via webhook.
 * Fire-and-forget — errors are logged but never thrown.
 */
export function sendGoogleChatAlert(text: string): void {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.warn('No GOOGLE_CHAT_WEBHOOK_URL configured');
    return;
  }

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).catch((error) => {
    logger.error(`Error sending Google Chat alert: ${getErrorMessage(error)}`);
  });
}

function formatPSTDateTime(date: Date): string {
  // Do not mix dateStyle/timeStyle with timeZoneName — engines throw (Invalid option).
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
}

/** Common footer appended to all operational alerts. */
export function alertFooter(): string {
  return `• Instance: \`${getNodeRunId()}\`
• App: ${process.env.APP_URL || 'https://APP_URL.missing'}
• Time: ${formatPSTDateTime(new Date())}`;
}

function getDbInfo(): string {
  try {
    const url = new URL(getConfig('db').dbUrl);
    const db = url.pathname.replace(/^\//, '') || 'unknown';
    const port = url.port || '5432';
    return `${url.hostname}:${port}/${db}`;
  } catch {
    return 'unknown';
  }
}

/** Extended info block for startup/shutdown alerts only. */
export async function serverInfoBlock(): Promise<string> {
  const { coreVersion } = await getSystemInfo();
  return `• App Version: \`${APP_VERSION}\`
• Core Version: \`${coreVersion}\`
• Node: \`${process.version}\`
• Database: \`${getDbInfo()}\`
• Port: \`${process.env.PORT || 3000}\``;
}
