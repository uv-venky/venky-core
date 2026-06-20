/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import clientLogger from '@/lib/core/client/client-logger';
import { getErrorMessage } from '@/lib/core/common/error';
import type { Store } from '@/lib/core/common/types/Store';
import { memo, useState } from 'react';
import { showError } from '@/components/core/common/Notification';
import { useIsStoreDirty } from '@/components/core/hooks/useStoreHooks';
import { Popup, type PopupProps } from '@/components/core/page/popup';
import { CircleX, Loader2, Save, Trash } from 'lucide-react';

interface EditPopupProps<T extends object> extends Omit<PopupProps, 'footer'> {
  store: Store<T>;
  /** Optional content rendered at the start of the footer (e.g. secondary actions) */
  footerContent?: React.ReactNode;
  keepOpen?: boolean;
  handleSave?: (onClose: () => void) => Promise<void>;
  onSaveSuccess?: () => void;
  allowDelete?: boolean;
}

function EditPopupComponent<T extends object>({
  store,
  onClose,
  children,
  footerContent,
  keepOpen,
  handleSave,
  onSaveSuccess,
  contentClassName,
  description = `Fill in the form and click save when you're done.`,
  allowDelete,
  ...props
}: EditPopupProps<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = useIsStoreDirty(store);

  const runSave = async (closeAfterSave: boolean) => {
    setIsSaving(true);
    try {
      if (handleSave) {
        await handleSave(closeAfterSave ? onClose : () => {});
        return;
      }
      const result = await store.save();
      if (result) {
        onSaveSuccess?.();
        if (closeAfterSave) {
          onClose();
        }
      }
    } catch (error) {
      showError(`Unexpected error while saving data: ${getErrorMessage(error)}`);
      clientLogger.error({ message: 'save error', error });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popup
      {...props}
      description={description}
      disableClose={isSaving}
      footer={
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <div className="flex-1">{footerContent}</div>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              data-testid="edit-popup-cancel"
              onClick={() => {
                store.resetStore();
                onClose();
              }}
            >
              <CircleX className="h-3.5 w-3.5" />
              Cancel
            </Button>
            {allowDelete && (
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
                data-testid="edit-popup-delete"
                onClick={async () => {
                  try {
                    const id = store?.currentRowId();
                    if (id) {
                      if (store.isCurrentRowFromDB()) {
                        await store.deleteRow(id);
                        await store.save();
                      } else {
                        await store.deleteRow(id);
                      }
                      onClose();
                    }
                  } catch (error) {
                    showError(`Unexpected error while deleting data: ${getErrorMessage(error)}`);
                    clientLogger.error({ message: 'delete error', error });
                  }
                }}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            )}
            {keepOpen && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || !isDirty}
                data-testid="edit-popup-save"
                onClick={() => runSave(false)}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              data-testid="edit-popup-save-close"
              onClick={() => runSave(true)}
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save & close
            </Button>
          </div>
        </div>
      }
      onClose={() => {
        store.resetStore();
        onClose();
      }}
    >
      {children}
    </Popup>
  );
}

export const EditPopup = memo(EditPopupComponent) as <T extends object>(props: EditPopupProps<T>) => React.ReactNode;
