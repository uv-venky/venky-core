import type { ISODateString } from '../../../../../lib/core/common/ds/types/DataSource';
import type { Filters } from '../../../../../lib/core/common/ds/types/filter';
import type { SavedTableColumnCustom } from '../../../../../lib/common/ds/types/core/SavedTableColumnCustom';
export type SavedSearchPayload<T> = {
    filters?: Filters<T>;
    /** Column order, visibility, sizing, density, and sticky preferences */
    custom?: SavedTableColumnCustom;
};
export interface SavedSearch<T> {
    appId: string;
    createdAt: ISODateString;
    createdBy: string;
    description?: string | null;
    id: string;
    isDefault: boolean;
    isPublic: boolean;
    itemId: string;
    name: string;
    owner: string;
    pageId: string;
    payload: SavedSearchPayload<T>;
    updatedAt: ISODateString;
    updatedBy: string;
}
//# sourceMappingURL=SavedSearch.d.ts.map