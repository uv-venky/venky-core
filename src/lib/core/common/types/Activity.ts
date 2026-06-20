export interface Activity {
  userName: string;
  eventType: string;
  eventId: string;
  metadata?: Record<string, unknown>;
  pageUrl?: string;
  dataSource?: string;
  elapsedTimeMs?: number;
  sessionId: string;
  rowCount?: number;
  apiName?: string;
  trackId?: string;
  createdAt: string;
  appVersion?: string;
  /** Command Center domain this activity belongs to (audit trail). Null for non-CC activity. */
  domainId?: string;
}
