'use client';
import { useEffect, useState, version as reactVersion } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useWindowSize from './core/hooks/useWindowSize';
import { useAppContext } from './sidebar/app-provider';
import { useClientSession } from '@/components/core/session-context';
import { useQueryWithOptions } from '@/lib/core/client/useQuery';
import { APP_VERSION } from '@/lib/app-info';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <p className="pt-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">{children}</p>;
}

export default function AboutDialog({ open, onOpenChange }: Props) {
  const [userAgent, setUserAgent] = useState('');
  const { width, height } = useWindowSize();
  const [resolution, setResolution] = useState(`${width} x ${height}`);
  const { APP_NAME, APP_DESCRIPTION } = useAppContext();
  const session = useClientSession();
  const envResult = useQueryWithOptions('getEnvironment', { enabled: open });
  const sysResult = useQueryWithOptions('getSystemInfo', { enabled: open });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (open) {
      setUserAgent(navigator.userAgent);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setResolution(`${width} x ${height}`);
    }
  }, [width, height, open]);

  const env = envResult.status === 'success' ? envResult.data : null;
  const sys = sysResult.status === 'success' ? sysResult.data : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[680px] sm:max-w-[90%]">
        <DialogHeader>
          <DialogTitle>{APP_NAME}</DialogTitle>
          <DialogDescription>{APP_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1 text-sm">
          <SectionLabel>Application</SectionLabel>
          <InfoRow label="Version" value={APP_VERSION} />
          <InfoRow label="Core" value={sys?.coreVersion ?? '...'} />
          {env?.APP_ID && <InfoRow label="Application ID" value={env.APP_ID} />}

          <SectionLabel>User</SectionLabel>
          <InfoRow label="User" value={`${session.name} (${session.userName})`} />
          <InfoRow label="Roles" value={session.roles.join(', ')} />

          <SectionLabel>Runtime</SectionLabel>
          <InfoRow label="React" value={reactVersion} />
          <InfoRow label="Next.js" value={sys?.nextVersion ?? '...'} />
          <InfoRow label="Node.js" value={sys?.nodeVersion ?? '...'} />

          <SectionLabel>Client</SectionLabel>
          <InfoRow label="Screen" value={resolution} />
          <InfoRow label="Timezone" value={timezone} />
          <InfoRow label="Local time" value={new Date().toString()} />
          <InfoRow label="Agent" value={userAgent} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
