import type { Apps } from '../../../../../../lib/common/ds/types/core/Apps';
interface AppStatusCardProps {
  app: Apps;
  onEdit?: (app: Apps) => void;
  onDelete?: (app: Apps) => void;
  onRefreshStatus?: (app: Apps) => Promise<void>;
  refreshKey?: number;
}
export declare function AppStatusCard({
  app,
  onEdit,
  onDelete,
  onRefreshStatus,
  refreshKey,
}: AppStatusCardProps): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=AppStatusCard.d.ts.map
