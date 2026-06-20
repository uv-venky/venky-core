'use client';

import { Button } from '@/components/ui/button';
import { showError } from '@/components/core/common/Notification';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useClipboardWithAnimation, type IconPaths } from '@/components/core/common/useClipboardWithAnimation';

const paths: IconPaths = {
  default: {
    color: 'gray',
    d: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  },
  success: {
    color: 'green',
    d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
};

export function ShareUrlButton() {
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState('');

  const { isLoading, isAnimating, pathRef, copyToClipboard } = useClipboardWithAnimation({
    paths,
    successMessage: 'Shortened URL copied to clipboard',
    errorMessage: 'Failed to copy URL',
    enableMobileShare: true,
    onError: () => {
      // Show dialog for manual copying on mobile
      setShowUrlDialog(true);
    },
  });

  const handleShare = async () => {
    try {
      // Get the current URL
      const currentUrl = window.location.href;

      // Create shortened URL
      const response = await fetch('/api/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentUrl }),
      });

      const result = await response.json();

      if (result.status === 'ERROR') {
        showError(result.message);
        return;
      }

      const url = result.data.shortenedUrl;
      setShortenedUrl(url);
      await copyToClipboard(url);
    } catch (error) {
      console.error(error);
      showError('Error', {
        description: 'Failed to create shortened URL',
      });
    }
  };

  return (
    <>
      <Button
        activityId="header-share-url"
        variant="ghost"
        size="icon"
        data-tip="Share URL"
        onClick={handleShare}
        disabled={isLoading || isAnimating}
        className="rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        {isLoading && <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />}
        <svg width="24px" height="24px" viewBox="0 0 24 24" className={isLoading ? 'hidden' : ''}>
          <path ref={pathRef} d={paths.default.d} fill={paths.default.color} />
        </svg>

        <span className="sr-only">Share URL</span>
      </Button>

      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share URL</DialogTitle>
            <DialogDescription>Copy the URL below to share it with others</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <textarea
              value={shortenedUrl}
              readOnly
              className="h-20 w-full resize-none rounded-md border bg-muted p-3 text-sm"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <p className="mt-2 text-muted-foreground text-xs">
              Tap the text above to select all, then copy and paste it anywhere.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
