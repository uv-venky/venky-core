import type { LookupTypes } from '../../../../../../lib/common/ds/types/core/LookupTypes';
interface LookupTypesPanelProps {
  selectedLookupType: LookupTypes | null;
  onSelectLookupType: (lookupType: LookupTypes | null) => void;
}
export declare function LookupTypesPanel({
  selectedLookupType,
  onSelectLookupType,
}: LookupTypesPanelProps): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=lookup-types-panel.d.ts.map
