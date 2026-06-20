/* Copyright (c) 2024-present Venky Corp. */

import type { ISODateTimeString } from '@/lib/core/common/ds/types/Base';

/**
 * Tracks one async audit-export request. Created when a `compliance`-role
 * user calls `requestComplianceExport`; picked up by the
 * `processComplianceExports` cron handler, which streams JSONL files for
 * AI invocations + tool calls + approvals + votes, computes per-file
 * SHA-256 + a manifest, zips, uploads to S3, and writes back a 24h-signed
 * URL plus row counts.
 *
 * Tenant-scoped via `appId` — a compliance user cannot read another
 * tenant's row.
 */
export type ComplianceExportStatus = 'queued' | 'running' | 'ready' | 'failed' | 'expired';

export interface WVComplianceExportRowCounts {
  invocations: number;
  toolCalls: number;
  approvals: number;
  votes: number;
}

export interface WVComplianceExports {
  id: string;
  appId: string;
  periodStart: ISODateTimeString;
  periodEnd: ISODateTimeString;
  requestedBy: string;
  status: ComplianceExportStatus;
  s3Key?: string | null;
  signedUrl?: string | null;
  signedUrlExpiresAt?: ISODateTimeString | null;
  manifestSha256?: string | null;
  rowCounts?: WVComplianceExportRowCounts | null;
  error?: string | null;
  createdAt: ISODateTimeString;
  startedAt?: ISODateTimeString | null;
  completedAt?: ISODateTimeString | null;
}
