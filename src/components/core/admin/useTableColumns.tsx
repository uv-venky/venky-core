/* Copyright (c) 2024-present Venky Corp. */

'use client';

import HeaderCell from '@/components/core/table/header-cell';
import TableCell from '@/components/core/table/table-cell';
import { Badge } from '@/components/ui/badge';
import type { UserSessions } from '@/lib/common/ds/types/core/UserSessions';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, CellContext } from '@tanstack/react-table';
import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { useRow, useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { Clock, Globe, LogOut, ShieldCheck } from 'lucide-react';
import { SiGooglechrome } from '@icons-pack/react-simple-icons';

const getBrowserInfo = (userAgent: string | undefined) => {
  if (!userAgent) return { name: 'Unknown', icon: Globe };
  if (userAgent.includes('Edge')) return { name: 'Edge', icon: Globe };
  if (userAgent.includes('Chrome')) return { name: 'Chrome', icon: SiGooglechrome };
  if (userAgent.includes('Firefox')) return { name: 'Firefox', icon: Globe };
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return { name: 'Safari', icon: Globe };
  return { name: 'Other', icon: Globe };
};

type SessionStatus = 'active' | 'expired' | 'signed-out';

const getSessionStatus = (session: UserSessions): SessionStatus => {
  const now = new Date();
  const expiresAt = parseISO(session.expiresAt);

  if (session.signedOutAt) {
    return 'signed-out';
  } else if (isAfter(now, expiresAt)) {
    return 'expired';
  }
  return 'active';
};

const STATUS_CONFIG: Record<
  SessionStatus,
  { icon: typeof ShieldCheck; color: string; bgColor: string; label: string }
> = {
  active: {
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'Active',
  },
  expired: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    label: 'Expired',
  },
  'signed-out': {
    icon: LogOut,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    label: 'Signed Out',
  },
};

export default function useTableColumns(store: Store<UserSessions>): AccessorKeyColumnDef<UserSessions>[] {
  return useMemo(() => {
    const columns: AccessorKeyColumnDef<UserSessions>[] = [
      {
        accessorKey: 'userName',
        meta: {
          label: 'User Name',
        },
        size: 180,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="userName" title="User Name" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="userName" {...props} />,
      },
      {
        accessorKey: 'status',
        meta: {
          label: 'Status',
        },
        size: 130,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="lastAccessedAt" title="Status" />;
        },
        cell: StatusCell,
      },
      {
        accessorKey: 'expiresAt',
        meta: {
          label: 'Expires At',
        },
        size: 180,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="expiresAt" title="Expires At" />;
        },
        cell: (props) => {
          return <DateToNowCell attributeCode="expiresAt" {...props} />;
        },
      },
      {
        accessorKey: 'signedInAt',
        meta: {
          label: 'Signed In At',
        },
        size: 180,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="signedInAt" title="Signed In At" />;
        },
        cell: (props) => {
          return <DateToNowCell attributeCode="signedInAt" {...props} />;
        },
      },
      {
        accessorKey: 'lastAccessedAt',
        meta: {
          label: 'Last Accessed At',
        },
        size: 180,
        header: (props) => {
          return (
            <HeaderCell {...props} type="Date" store={store} accessorKey="lastAccessedAt" title="Last Accessed At" />
          );
        },
        cell: (props) => {
          return <DateToNowCell attributeCode="lastAccessedAt" {...props} />;
        },
      },
      {
        accessorKey: 'signedOutAt',
        meta: {
          label: 'Signed Out At',
        },
        size: 180,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="signedOutAt" title="Signed Out At" />;
        },
        cell: (props) => {
          return <DateToNowCell attributeCode="signedOutAt" {...props} />;
        },
      },
      {
        accessorKey: 'ipAddress',
        meta: {
          label: 'IP Address',
        },
        size: 160,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="ipAddress" title="Ip Address" />;
        },
        cell: IpAddressCell,
      },
      {
        accessorKey: 'userAgent',
        meta: {
          label: 'Browser',
        },
        size: 140,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="userAgent" title="User Agent" />;
        },
        cell: UserAgentCell,
      },
    ];
    return columns;
  }, [store]);
}

function UserAgentCell(props: CellContext<UserSessions, unknown>) {
  const { row } = props;
  const store = useCurrentStore<UserSessions>();
  assertExists(store, 'Missing store in UserAgentCell');
  const userAgent = useRowValue(store, row.id, 'userAgent');

  const browser = getBrowserInfo(userAgent);
  const Icon = browser.icon;

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-border/50 bg-muted/30 font-normal text-muted-foreground"
      data-tip={userAgent}
    >
      <Icon className="size-3" />
      {browser.name}
    </Badge>
  );
}

function IpAddressCell(props: CellContext<UserSessions, unknown>) {
  const { row } = props;
  const store = useCurrentStore<UserSessions>();
  assertExists(store, 'Missing store in IpAddressCell');
  const ipAddress = useRowValue(store, row.id, 'ipAddress');

  return (
    <div className="flex items-center gap-2">
      <Globe className="size-3.5 text-muted-foreground" />
      <span className="font-mono text-sm">{ipAddress}</span>
    </div>
  );
}

function DateToNowCell(props: CellContext<UserSessions, unknown> & { attributeCode: string }) {
  const { row, attributeCode } = props;
  const store = useCurrentStore<UserSessions>();
  assertExists(store, 'Missing store in DateToNowCell');
  const value = useRowValue(store, row.id, attributeCode as keyof UserSessions);

  if (typeof value !== 'string') return <span className="text-muted-foreground">—</span>;

  const date = parseISO(value);

  return (
    <div className="space-y-0.5">
      <div className="font-medium text-sm">{format(date, 'MMM d, h:mm a')}</div>
      <div className="text-muted-foreground text-xs">{formatDistanceToNow(date, { addSuffix: true })}</div>
    </div>
  );
}

function StatusCell() {
  const store = useCurrentStore<UserSessions>();
  assertExists(store, 'Missing store in StatusCell');
  const sessionRow = useRow(store) as UserSessions;

  const status = getSessionStatus(sessionRow);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1.5 border font-normal', config.bgColor, config.color)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
