import type { DataSource } from '../types';
interface SecurityPanelProps {
  selectedDS: DataSource;
  roleCode: string | null;
  setRole: (role: string | null) => void;
  userName: string;
  roles: string[];
}
export declare function SecurityPanel({
  selectedDS,
  roleCode,
  setRole,
  userName,
  roles,
}: SecurityPanelProps): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=security-panel.d.ts.map
