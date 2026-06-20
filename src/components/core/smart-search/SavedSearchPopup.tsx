import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useId } from 'react';
import { SearchInput } from '@/components/core/smart-search/SearchInput';
import { Loader2 } from 'lucide-react';
import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { Popup } from '@/components/core/page/popup';
import { useClientSession } from '@/components/core/session-context';
import { TextInput } from '@/components/core/page/fields';
import { showError } from '@/components/core/common/Notification';
import { isEmpty } from '@/lib/core/common/isEmpty';

type Props<T extends object> = {
  onClose: () => void;
  onCreate: (view: SavedSearch<T>) => Promise<void>;
  onUpdate: (view: SavedSearch<T>) => Promise<void>;
  view: SavedSearch<T>;
  forSmartSearch?: boolean;
  stickyFilters?: (keyof T)[];
};

export default function SavedSearchPopup<T extends object>(props: Props<T>) {
  const session = useClientSession();
  const allowsPublicViews = session?.roles.includes('admin') || session?.roles.includes('app_admin');
  const { onClose, onCreate, onUpdate, view, forSmartSearch, stickyFilters } = props;
  const [draftView, setDraftView] = useState<SavedSearch<T>>(view);

  const defaultId = useId();
  const publicId = useId();
  const searchFiltersId = useId();
  const [isLoading, setIsLoading] = useState(false);
  const [includeSearchFilters, setIncludeSearchFilters] = useState(!!draftView.payload?.filters?.length);
  return (
    <Popup
      onClose={onClose}
      title={view.id ? 'Update View' : 'Create New View'}
      description={view.id ? 'Update an existing saved search view' : 'Create a new saved search view'}
      width={800}
      height={600}
      footer={
        <>
          <Button variant="outline" onClick={() => onClose()} data-testid="saved-search-cancel-button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="saved-search-save-button"
            onClick={async () => {
              if (isEmpty(draftView.name)) {
                showError('Name is required!');
                return;
              }
              setIsLoading(true);
              let _draftView = draftView;
              if (!includeSearchFilters) {
                _draftView = {
                  ...draftView,
                  payload: { ...draftView.payload, filters: undefined },
                };
              }
              try {
                if (view.id) {
                  await onUpdate(_draftView);
                } else {
                  await onCreate(_draftView);
                }
                onClose();
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} {view.id ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 py-4">
        <TextInput
          value={draftView.name ?? ''}
          onChange={(value) => setDraftView({ ...draftView, name: value ?? '' })}
          label="Name"
          required
          dataTestId="saved-search-name-input"
        />
        <TextInput
          value={draftView.description ?? ''}
          onChange={(value) => setDraftView({ ...draftView, description: value ?? '' })}
          label="Description"
          dataTestId="saved-search-description-input"
        />
        <div className="flex items-center space-x-2">
          <Switch
            checked={draftView.isDefault}
            id={defaultId}
            data-testid="saved-search-default"
            onCheckedChange={(checked) => setDraftView({ ...draftView, isDefault: checked })}
          />
          <Label htmlFor={defaultId}>Make Default</Label>
        </div>
        {allowsPublicViews && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={draftView.isPublic}
              id={publicId}
              data-testid="saved-search-public"
              onCheckedChange={(checked) => setDraftView({ ...draftView, isPublic: checked })}
            />
            <Label htmlFor={publicId}>Make Public</Label>
          </div>
        )}
        {forSmartSearch && (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                disabled={!draftView.payload?.filters?.length}
                checked={includeSearchFilters}
                id={searchFiltersId}
                data-testid="saved-search-include-search-filters"
                onCheckedChange={setIncludeSearchFilters}
              />
              <Label htmlFor={searchFiltersId}>Include Search Filters</Label>
            </div>
            <div className="font-semibold text-lg">Search</div>
            {includeSearchFilters ? (
              <SearchInput readOnly excludeStickyFilters stickyFilters={stickyFilters} />
            ) : draftView.payload?.filters?.length ? (
              <span className="text-muted-foreground text-sm">Search filters are not included in this view.</span>
            ) : (
              <span className="text-muted-foreground text-sm">No search filters are available for this view.</span>
            )}
          </>
        )}
      </div>
    </Popup>
  );
}
