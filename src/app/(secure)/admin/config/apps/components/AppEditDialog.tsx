/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextInput, ComboboxInput, PasswordInput } from '@/components/core/page/fields';
import { Loader2, Check, RefreshCw } from 'lucide-react';
import type { Apps } from '@/lib/common/ds/types/core/Apps';
import type { Store } from '@/lib/core/common/types/Store';
import { useCurrentRowSync, useIsStoreDirty, useIsStorePosting } from '@/components/core/hooks/useStoreHooks';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';
import type { SidebarIcon } from '@/components/sidebar/icons';
import { AppIcon, appSidebarIcons } from '@/components/sidebar/icons';
import { useAppContext } from '@/components/sidebar/app-provider';

interface AppEditDialogProps {
  app: Apps;
  store: Store<Apps>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Converts an icon name to a readable label
 * Examples:
 * - "MiniLogo" -> "Mini Logo"
 * - "BarChart3" -> "Bar Chart 3"
 * - "Settings2" -> "Settings"
 * - "LayoutDashboard" -> "Layout Dashboard"
 */
function iconNameToLabel(iconName: string): string {
  // Handle special case for MiniLogo
  if (iconName === 'MiniLogo') {
    return 'Mini Logo';
  }

  // Convert camelCase to Title Case with spaces
  // Insert space before capital letters and numbers
  const spaced = iconName.replace(/([a-z])([A-Z0-9])/g, '$1 $2');

  // Handle trailing numbers (like Settings2 -> Settings)
  // But keep numbers in the middle (like BarChart3 -> Bar Chart 3)
  const withoutTrailingNumber = spaced.replace(/\s+(\d+)$/, '');

  // Capitalize first letter of each word
  return withoutTrailingNumber
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generates a secure random token using the crypto API
 * @returns A 64-character hexadecimal token
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function AppEditDialog({ app, store, open, onOpenChange }: AppEditDialogProps) {
  const row = useCurrentRowSync(store);
  const isDirty = useIsStoreDirty(store);
  const isPosting = useIsStorePosting(store);
  const isPersisted = store.isCurrentRowFromDB();
  const { customSidebarIcons } = useAppContext();

  const iconOptions = useMemo<Array<{ value: SidebarIcon; label: string }>>(() => {
    const coreKeys = new Set(['MiniLogo', ...Object.keys(appSidebarIcons)]);
    const coreOptions: Array<{ value: SidebarIcon; label: string }> = [
      { value: 'MiniLogo', label: iconNameToLabel('MiniLogo') },
      ...(Object.keys(appSidebarIcons) as Array<keyof typeof appSidebarIcons>).map((iconKey) => ({
        value: iconKey as SidebarIcon,
        label: iconNameToLabel(iconKey),
      })),
    ];
    const customOptions = customSidebarIcons
      ? (Object.keys(customSidebarIcons) as Array<keyof typeof customSidebarIcons>)
          .filter((key) => !coreKeys.has(key))
          .map((iconKey) => ({
            value: iconKey as SidebarIcon,
            label: iconNameToLabel(iconKey),
          }))
      : [];
    return [...coreOptions, ...customOptions];
  }, [customSidebarIcons]);

  useEffect(() => {
    if (open && app) {
      const rowId = store.rowId(app);
      store.setCurrentRowId(rowId);
    }
  }, [open, app, store]);

  const handleGenerateToken = async () => {
    if (!row) return;
    try {
      const token = generateSecureToken();
      store.setValue('statusToken', token);
    } catch (error) {
      showError(`Failed to generate token: ${getErrorMessage(error)}`);
    }
  };

  const handleSave = async () => {
    if (!isDirty || isPosting || !row) return;

    try {
      // Validate URL
      if (row.fullUrl) {
        try {
          new URL(row.fullUrl);
        } catch {
          showError('Invalid URL format');
          return;
        }
      }

      await store.save({ feedback: 'App saved successfully' });
      onOpenChange(false);
    } catch (error) {
      showError(`Failed to save app: ${getErrorMessage(error)}`);
    }
  };

  const handleCancel = () => {
    store.resetStore();
    onOpenChange(false);
  };

  if (!row) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          store.resetStore();
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{row.appId ? 'Edit App' : 'New App'}</DialogTitle>
          <DialogDescription>
            Configure the app details. The status token is used to authenticate status API requests.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <TextInput
            label="App ID"
            value={row.appId || ''}
            onChange={(value) => store.setValue('appId', value || '')}
            labelOnTop
            required
            disabled={isPersisted} // Disable editing app ID once saved to database
          />
          <TextInput
            label="Name"
            value={row.name || ''}
            onChange={(value) => store.setValue('name', value || '')}
            labelOnTop
            required
          />
          <TextInput
            label="Full URL"
            value={row.fullUrl || ''}
            onChange={(value) => store.setValue('fullUrl', value || '')}
            labelOnTop
            required
            placeholder="https://example.com"
          />
          <ComboboxInput
            label="Icon"
            labelOnTop
            value={row.icon || 'MiniLogo'}
            options={iconOptions}
            getValue={(opt) => opt.value}
            getLabel={(opt) => opt.label}
            getIcon={(opt) => <AppIcon icon={opt.value} />}
            onSelect={(value) => store.setValue('icon', (value || 'MiniLogo') as SidebarIcon)}
            placeholder="Select an icon..."
            searchPlaceholder="Search icons..."
            emptyText="No icons found"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Status Token</span>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateToken} className="h-7">
                <RefreshCw className="mr-1 size-3" />
                Generate
              </Button>
            </div>
            <PasswordInput
              value={row.statusToken || ''}
              onChange={(value) => store.setValue('statusToken', value || null)}
              placeholder="Leave empty or generate a secure token"
              className="w-full"
            />
            <p className="text-muted-foreground text-xs">
              Bearer token used to authenticate requests to /api/p/status endpoint
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPosting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPosting || !isDirty}>
            {isPosting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 size-4" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
