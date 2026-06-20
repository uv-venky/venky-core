export interface TtlStore {
  appId: string;
  key: string;
  data: unknown;
  expiresAt: string;
  createdAt: string;
}
