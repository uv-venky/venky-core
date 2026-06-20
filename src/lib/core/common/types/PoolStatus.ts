export interface PoolStatus {
  idleCount: number;
  totalCount: number;
  expiredCount: number;
  waitingCount: number;
  listenerCount: number;
}
