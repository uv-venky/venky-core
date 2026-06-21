import type { Store } from '../../../lib/core/common/types/Store';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import { type ReactNode } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
import type { NewRow, StringKeyof, Filters as FiltersType } from '../../../lib/core/common/ds/types/filter';
import type { TableVariant } from '../../../components/core/common/types';
type Props<T extends object> = {
  store: Store<T>;
  filterStartContent?: ReactNode;
  filterEndContent?: ReactNode;
  toolbarContent?: ReactNode;
  hideColumnsMenu?: boolean;
  hideFilters?: boolean;
  hidePagination?: boolean;
  smartSearchColumns: Column<T>[];
  tableColumns: AccessorKeyColumnDef<T>[];
  pageId: string;
  itemId: string;
  title: string;
  subTitle: string;
  icon: ReactNode;
  editForm?: ReactNode;
  /** Optional content rendered in the edit sheet/popup footer (e.g. secondary actions) */
  editFormFooterContent?: ReactNode;
  getDefaultRow?: () => NewRow<T>;
  addNewButtonText?: string;
  loadingRows?: number;
  searchOnBlur?: boolean;
  defaultVisibleColumnOrder?: StringKeyof<T>[];
  rowClickToEdit?: boolean;
  popupWidth?: number;
  popupHeight?: number;
  popupBodyClassName?: string;
  editFormLayout?: 'sheet' | 'popup';
  disableHeaderFilters?: boolean;
  updateFilters?: (filters: FiltersType<T>) => FiltersType<T>;
  stickyFilters?: (keyof T)[];
  /** Opt in on this page. Blocked when deployment config sets `features.naturalLanguageSearch: false`. */
  enableNaturalLanguageSearch?: boolean;
  /** Placeholder for natural-language search mode. */
  nlPlaceholder?: string;
  allowDelete?: boolean;
  handleSave?: (onClose: () => void) => Promise<void>;
  onSaveSuccess?: () => void;
  keepOpen?: boolean;
  showExportButton?: boolean;
  exportFilename?: string;
  exportIncludeMetadata?: boolean;
  editFormSubTitle?: string;
  tableVariant?: TableVariant;
  statsSection?: ReactNode;
};
export default function PageLayoutTemplate<T extends object>({
  store,
  filterStartContent,
  filterEndContent,
  hideColumnsMenu,
  hideFilters,
  hidePagination,
  smartSearchColumns,
  tableColumns,
  pageId,
  itemId,
  title,
  subTitle,
  icon,
  editForm,
  editFormFooterContent,
  getDefaultRow,
  addNewButtonText,
  toolbarContent,
  loadingRows,
  searchOnBlur,
  defaultVisibleColumnOrder,
  rowClickToEdit,
  popupWidth,
  popupHeight,
  popupBodyClassName,
  editFormLayout,
  disableHeaderFilters: disableHeaderFiltersProp,
  updateFilters,
  stickyFilters,
  allowDelete,
  handleSave,
  onSaveSuccess,
  keepOpen,
  showExportButton,
  exportFilename,
  exportIncludeMetadata,
  editFormSubTitle,
  tableVariant,
  enableNaturalLanguageSearch,
  nlPlaceholder,
  statsSection,
}: Props<T>): import('react/jsx-runtime').JSX.Element;
export declare function PaginationSection<T extends object>({
  table,
  store,
  hideRowsPerPageSelector,
}: {
  table: Table<T>;
  store: Store<T>;
  hideRowsPerPageSelector?: boolean;
}): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=page-layout-template.d.ts.map
