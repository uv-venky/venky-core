/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Globe, Plus, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { confirmWithUser } from '@/components/core/common';
import { showError, showSuccess } from '@/components/core/common/Notification';
import { useIsStoreLoading, useRows } from '@/components/core/hooks/useStoreHooks';
import PageLayout from '@/components/core/page/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Apps } from '@/lib/common/ds/types/core/Apps';
import { getErrorMessage } from '@/lib/core/common/error';
import { AppEditDialog, generateSecureToken } from './components/AppEditDialog';
import { AppStatusCard } from './components/AppStatusCard';
import { useAppsStore } from './hooks/use-apps-store';
export default function AppsPageContent() {
  const appsStore = useAppsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingApp, setEditingApp] = useState<Apps | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const apps = useRows(appsStore);
  const isLoading = useIsStoreLoading(appsStore);

  // Filter apps by search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) {
      return apps;
    }
    const query = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name?.toLowerCase().includes(query) ||
        app.fullUrl?.toLowerCase().includes(query) ||
        app.appId?.toLowerCase().includes(query),
    );
  }, [apps, searchQuery]);

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      await appsStore.createNew({
        partialRecord: {
          name: 'New App',
          fullUrl: 'https://',
          statusToken: generateSecureToken(),
          icon: 'MiniLogo',
        },
      });
      const newRow = appsStore.currentRow();
      if (newRow) {
        setEditingApp(newRow as Apps);
      }
    } catch (error) {
      showError(`Failed to create app: ${getErrorMessage(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (app: Apps) => {
    setEditingApp(app);
  };

  const handleDelete = async (app: Apps) => {
    const appName = app.name || 'this app';
    if (
      !(await confirmWithUser({
        title: 'Delete App',
        content: `Are you sure you want to delete "${appName}"?`,
        confirmButtonLabel: 'Delete',
      }))
    ) {
      return;
    }
    try {
      await appsStore.deleteRow(appsStore.rowId(app));
      await appsStore.save({ feedback: 'App deleted successfully', silent: true });
    } catch (error) {
      showError(`Failed to delete app: ${getErrorMessage(error)}`);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      await appsStore.executeQuery({ force: true });
      setRefreshKey((prev) => prev + 1);
      showSuccess('Status refreshed');
    } catch (error) {
      showError(`Failed to refresh: ${getErrorMessage(error)}`);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const handleRefreshStatus = async (_app: Apps) => {
    // Individual refresh is handled by AppStatusCard component
    // This is just a placeholder for the callback
  };

  const content = isLoading ? (
    <div className="container mx-auto space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  ) : (
    <div className="container mx-auto space-y-6 p-4">
      {/* Header with Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshAll} disabled={isRefreshingAll} className="shrink-0">
            <RefreshCw className={isRefreshingAll ? 'mr-2 size-4 animate-spin' : 'mr-2 size-4'} />
            Refresh All
          </Button>
          <Button onClick={handleCreateNew} disabled={isCreating} size="lg" className="shrink-0">
            <Plus className="mr-2 size-4" />
            {isCreating ? 'Creating...' : 'Add New App'}
          </Button>
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Globe className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No apps found</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            {searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first app'}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateNew} disabled={isCreating}>
              <Plus className="mr-2 size-4" />
              Add New App
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredApps.map((app) => (
            <AppStatusCard
              key={appsStore.rowId(app)}
              app={app as Apps}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefreshStatus={handleRefreshStatus}
              refreshKey={refreshKey}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <PageLayout
        title="Apps Registry"
        subTitle="Manage and monitor all applications"
        icon={<Globe className="size-12 text-muted-foreground" />}
        enableShareUrl={true}
        showUserProfile={true}
        showThemeToggle={true}
        enableComments={true}
      >
        {content}
      </PageLayout>
      {editingApp && (
        <AppEditDialog
          app={editingApp}
          store={appsStore}
          open={!!editingApp}
          onOpenChange={(open) => {
            if (!open) {
              setEditingApp(null);
            }
          }}
        />
      )}
    </>
  );
}
