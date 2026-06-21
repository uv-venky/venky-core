import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { useState, useId } from 'react';
import { SearchInput } from '../../../components/core/smart-search/SearchInput';
import { Loader2 } from 'lucide-react';
import { Popup } from '../../../components/core/page/popup';
import { useClientSession } from '../../../components/core/session-context';
import { TextInput } from '../../../components/core/page/fields';
import { showError } from '../../../components/core/common/Notification';
import { isEmpty } from '../../../lib/core/common/isEmpty';
export default function SavedSearchPopup(props) {
    const session = useClientSession();
    const allowsPublicViews = session?.roles.includes('admin') || session?.roles.includes('app_admin');
    const { onClose, onCreate, onUpdate, view, forSmartSearch, stickyFilters } = props;
    const [draftView, setDraftView] = useState(view);
    const defaultId = useId();
    const publicId = useId();
    const searchFiltersId = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [includeSearchFilters, setIncludeSearchFilters] = useState(!!draftView.payload?.filters?.length);
    return (_jsx(Popup, { onClose: onClose, title: view.id ? 'Update View' : 'Create New View', description: view.id ? 'Update an existing saved search view' : 'Create a new saved search view', width: 800, height: 600, footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => onClose(), "data-testid": "saved-search-cancel-button", children: "Cancel" }), _jsxs(Button, { type: "submit", disabled: isLoading, "data-testid": "saved-search-save-button", onClick: async () => {
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
                            }
                            else {
                                await onCreate(_draftView);
                            }
                            onClose();
                        }
                        finally {
                            setIsLoading(false);
                        }
                    }, children: [isLoading && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), " ", view.id ? 'Update' : 'Create'] })] }), children: _jsxs("div", { className: "grid gap-4 py-4", children: [_jsx(TextInput, { value: draftView.name ?? '', onChange: (value) => setDraftView({ ...draftView, name: value ?? '' }), label: "Name", required: true, dataTestId: "saved-search-name-input" }), _jsx(TextInput, { value: draftView.description ?? '', onChange: (value) => setDraftView({ ...draftView, description: value ?? '' }), label: "Description", dataTestId: "saved-search-description-input" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: draftView.isDefault, id: defaultId, "data-testid": "saved-search-default", onCheckedChange: (checked) => setDraftView({ ...draftView, isDefault: checked }) }), _jsx(Label, { htmlFor: defaultId, children: "Make Default" })] }), allowsPublicViews && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: draftView.isPublic, id: publicId, "data-testid": "saved-search-public", onCheckedChange: (checked) => setDraftView({ ...draftView, isPublic: checked }) }), _jsx(Label, { htmlFor: publicId, children: "Make Public" })] })), forSmartSearch && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { disabled: !draftView.payload?.filters?.length, checked: includeSearchFilters, id: searchFiltersId, "data-testid": "saved-search-include-search-filters", onCheckedChange: setIncludeSearchFilters }), _jsx(Label, { htmlFor: searchFiltersId, children: "Include Search Filters" })] }), _jsx("div", { className: "font-semibold text-lg", children: "Search" }), includeSearchFilters ? (_jsx(SearchInput, { readOnly: true, excludeStickyFilters: true, stickyFilters: stickyFilters })) : draftView.payload?.filters?.length ? (_jsx("span", { className: "text-muted-foreground text-sm", children: "Search filters are not included in this view." })) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "No search filters are available for this view." }))] }))] }) }));
}
//# sourceMappingURL=SavedSearchPopup.js.map